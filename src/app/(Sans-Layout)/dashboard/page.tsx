"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import NavBar from "@/app/components/navbar";
import {
  getSpotsFromDb,
  getArchivedSpotsFromDb,
  getComments,
  addComment,
  toggleParticipation,
  archiveSpot
} from "@/app/actions/spotActions";

const MapComponent = dynamic(
  () => import("@/app/components/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-zinc-100 flex items-center justify-center rounded-lg">
        <div className="text-zinc-400 text-sm animate-pulse italic">Chargement de la GreenMap...</div>
      </div>
    )
  }
);

export default function MaPage() {
  const [dbSpots, setDbSpots] = useState<any[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"Event" | "Signalement">("Event");

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [participatingStatus, setParticipatingStatus] = useState<Record<number, boolean>>({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resSpots, resArchived] = await Promise.all([
        getSpotsFromDb(),
        getArchivedSpotsFromDb()
      ]);

      let allSpotsForMap: any[] = [];
      let combinedNews: any[] = [];

      if (resSpots.success && resSpots.data) {
        allSpotsForMap = [...resSpots.data];
        const activeItems = resSpots.data
          .filter((s: any) => s.type === "Event" || s.type === "Signalement")
          .map((e: any) => ({ ...e, isArchived: false }));
        combinedNews = [...activeItems];
      }

      if (resArchived.success && resArchived.data) {
        allSpotsForMap = [...allSpotsForMap, ...resArchived.data];
        const archivedItems = resArchived.data
          .filter((s: any) => s.type === "Event" || s.type === "Signalement")
          .map((e: any) => ({ ...e, isArchived: true }));
        combinedNews = [...combinedNews, ...archivedItems];
      }

      combinedNews.sort((a, b) => {
        const dateB = new Date(b.date || b.created_at || Date.now()).getTime();
        const dateA = new Date(a.date || a.created_at || Date.now()).getTime();
        return dateB - dateA;
      });

      setDbSpots(allSpotsForMap);
      setNewsItems(combinedNews);
    } catch (err) {
      console.error("Erreur chargement Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return newsItems.filter(item => {
      if (item.type !== activeFilter) return false;
      if (statusFilter === "active" && item.isArchived) return false;
      if (statusFilter === "archived" && !item.isArchived) return false;
      if (item.isArchived) {
        const UNE_SEMAINE_MS = 7 * 24 * 60 * 60 * 1000;
        const dateArchive = new Date(item.created_at || Date.now()).getTime();
        if ((Date.now() - dateArchive) >= UNE_SEMAINE_MS) return false;
      }
      const content = `${item.title} ${item.description}`.toLowerCase();
      if (searchQuery && !content.includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [newsItems, activeFilter, statusFilter, searchQuery]);

  const handleEventClick = async (item: any) => {
    setSelectedSpot({ ...item, _clickTimestamp: Date.now() });
    setIsPanelOpen(true);
    const res = await getComments(item.id);
    if (res.success) setCommentsMap((prev) => ({ ...prev, [item.id]: res.data }));
  };

  const handleAddComment = async (spotId: number) => {
    const value = (commentInputs[spotId] ?? "").trim();
    if (!value) return;
    const res = await addComment(spotId, "Anonyme", value);
    if (res.success) {
      setCommentInputs((prev) => ({ ...prev, [spotId]: "" }));
      const refreshed = await getComments(spotId);
      if (refreshed.success) setCommentsMap((prev) => ({ ...prev, [spotId]: refreshed.data }));
    }
  };

  const handleParticipate = async (spotId: number) => {
    const currentParticipants = selectedSpot?.participants_count || 0;
    if (!participatingStatus[spotId] && selectedSpot?.type === "Signalement" && currentParticipants >= 5) {
      alert("Limite de 5 participants atteinte pour ce signalement.");
      return;
    }
    const res = await toggleParticipation(spotId, "Anonyme");
    if (res.success) {
      const isNowParticipating = res.participating ?? false;
      setParticipatingStatus((prev) => ({ ...prev, [spotId]: isNowParticipating }));

      if (selectedSpot && selectedSpot.id === spotId) {
        setSelectedSpot((prev: any) => ({
          ...prev,
          participants_count: isNowParticipating
            ? (prev.participants_count || 0) + 1
            : Math.max(0, (prev.participants_count || 0) - 1)
        }));
      }
    }
  };

  const handleArchive = async (spotId: number) => {
    if (!confirm("Voulez-vous marquer ce signalement comme terminé ? Il sera déplacé dans les archives.")) return;
    const res = await archiveSpot(spotId);
    if (res.success) {
      setIsPanelOpen(false);
      setSelectedSpot(null);
      await loadData();
    } else {
      alert("Erreur lors de l'archivage : " + res.error);
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Date inconnue";

    // Si c'est une string SQL type "2024-03-04 15:06:09", 
    // on remplace l'espace par 'T' pour aider certains navigateurs
    const dateString = typeof dateValue === 'string'
      ? dateValue.replace(' ', 'T')
      : dateValue;

    const date = new Date(dateString);

    // Vérification si la date est valide
    if (isNaN(date.getTime())) return "Format date invalide";

    return date.toLocaleDateString("fr-FR", {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <NavBar />

      {/* POP-UP LATÉRALE */}
      <div className={`fixed top-0 left-0 h-full z-[200] bg-white border-r border-zinc-200 shadow-2xl transition-transform duration-300 ease-in-out w-full sm:w-[450px] ${isPanelOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {selectedSpot && (
          <div className="h-full flex flex-col p-0 overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-800 truncate pr-4">Détails</h3>
              <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors border border-zinc-100 shadow-sm">✕</button>
            </div>
            <div className="p-6">
              <img src={selectedSpot.image || "https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=400"} className="w-full aspect-video object-cover rounded-xl shadow-sm mb-4" />

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${selectedSpot.type === 'Event' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{selectedSpot.type}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${selectedSpot.isArchived ? "bg-zinc-400" : "bg-amber-500"}`}>{selectedSpot.isArchived ? "Terminé" : "En cours"}</span>
              </div>

              <h2 className="text-2xl font-bold text-zinc-800 mb-6">{selectedSpot.title}</h2>

              {/* SECTION INFOS CLÉS ADAPTATIVE */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm">

                {/* COLONNE GAUCHE : Date/Heure (Event) OU Urgence (Signalement) */}
                <div className="flex flex-col border-r border-zinc-200 pr-2">
                  {selectedSpot.type === "Event" ? (
                    <>
                      <span className="text-[10px] uppercase text-zinc-400 font-black tracking-widest mb-1 flex items-center gap-1">
                        📅 Date & Heure
                      </span>
                      <div className="text-sm font-semibold text-zinc-700 leading-tight">
                        {formatDate(selectedSpot.date)}
                        {selectedSpot.hours && (
                          <span className="block text-teal-600 font-bold mt-1 text-base">à {selectedSpot.hours}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase text-zinc-400 font-black tracking-widest mb-1 flex items-center gap-1">
                        ⚠️ Niveau d'Urgence
                      </span>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedSpot.urgency === 'Haute' ? 'bg-rose-100 text-rose-600' :
                          selectedSpot.urgency === 'Moyenne' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                          {selectedSpot.urgency || "Non spécifiée"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* COLONNE DROITE : Participants */}
                <div className="flex flex-col pl-2">
                  <span className="text-[10px] uppercase text-zinc-400 font-black tracking-widest mb-1 flex items-center gap-1">
                    👥 Participants
                  </span>
                  <div className="text-sm font-semibold text-zinc-700">
                    <span className="text-2xl text-zinc-900 block leading-none mb-1">
                      {selectedSpot.participants_count || 0}
                    </span>
                    <span className="text-[11px] text-zinc-500 uppercase">
                      {selectedSpot.type === "Signalement" ? "5 personnes maximum" : `sur ${selectedSpot.max_participants || "∞"} places`}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-zinc-600 text-sm mb-8 leading-relaxed px-1 font-medium">{selectedSpot.description}</p>

              {!selectedSpot.isArchived && (
                <div className="space-y-3 mb-10">
                  <button
                    className={`w-full py-3.5 rounded-xl font-bold transition-all transform active:scale-95 ${participatingStatus[selectedSpot.id] ? "bg-zinc-100 text-zinc-500 border border-zinc-200" : "bg-teal-500 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-600"}`}
                    onClick={() => handleParticipate(selectedSpot.id)}
                  >
                    {participatingStatus[selectedSpot.id] ? "✓ Vous participez" : (selectedSpot.type === "Signalement" ? "Aider à résoudre" : "Réserver ma place")}
                  </button>
                  {selectedSpot.type === "Signalement" && participatingStatus[selectedSpot.id] && (
                    <button onClick={() => handleArchive(selectedSpot.id)} className="w-full py-3 rounded-xl font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all">
                      Marquer comme terminé
                    </button>
                  )}
                </div>
              )}

              <div className="border-t pt-6 pb-10">
                <h4 className="font-bold text-zinc-800 mb-4 text-xs uppercase tracking-widest">Discussion</h4>
                <div className="space-y-3 mb-6">
                  {commentsMap[selectedSpot.id]?.map((c: any) => (
                    <div key={c.id} className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs">
                      <p className="font-black text-teal-600 mb-1">{c.author}</p>
                      <p className="text-zinc-600">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={commentInputs[selectedSpot.id] || ""} onChange={(e) => setCommentInputs(prev => ({ ...prev, [selectedSpot.id]: e.target.value }))} placeholder="Votre message..." className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-xs outline-none focus:border-teal-500 transition-colors" />
                  <button onClick={() => handleAddComment(selectedSpot.id)} className="bg-zinc-800 text-white p-2.5 rounded-full hover:bg-teal-600 transition-colors">➤</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-800">Fil d'actualité</h2>
                <div className="inline-flex rounded-lg bg-zinc-100 p-1">
                  {(["Event", "Signalement"] as const).map((type) => (
                    <button key={type} onClick={() => setActiveFilter(type)} className={`rounded-md px-3 py-1 text-sm font-medium ${activeFilter === type ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-500"}`}>
                      {type === "Event" ? "Événements" : "Signalements"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-4 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex bg-zinc-100 rounded-xl p-1">
                  {[
                    { id: "all", label: "Tous" },
                    { id: "active", label: "En cours" },
                    { id: "archived", label: "Terminés" }
                  ].map((s) => (
                    <button key={s.id} onClick={() => setStatusFilter(s.id as any)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${statusFilter === s.id ? "bg-white text-teal-600 shadow-sm" : "text-zinc-500"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12 animate-spin text-teal-500 text-xl">⏳</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredItems.map((item) => (
                  <article key={item.id} onClick={() => handleEventClick(item)} className={`overflow-hidden rounded-xl border transition-all cursor-pointer bg-white shadow-sm ${selectedSpot?.id === item.id ? "border-teal-500 ring-2 ring-teal-500/20" : "border-zinc-200 hover:border-zinc-300"}`}>
                    <div className="relative aspect-[5/3]">
                      <img src={item.image || "https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=400"} className="h-full w-full object-cover" />
                      <span className={`absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-bold uppercase text-white ${item.isArchived ? "bg-zinc-400" : "bg-amber-500"}`}>{item.isArchived ? "Terminé" : "En cours"}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-zinc-800">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-zinc-800">Map</h2>
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500"></span><span>Événement</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-500"></span><span>Signalement</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-500"></span><span>Point de Tri</span></div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm h-[500px] relative z-0">
              <MapComponent dbSpots={dbSpots} onSelectSpot={handleEventClick} selectedSpot={selectedSpot} isDashboard={true} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}