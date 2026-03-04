"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import NavBar from "@/app/components/navbar";
import { getSpotsFromDb, getArchivedSpotsFromDb, getComments, addComment, toggleParticipation } from "@/app/actions/spotActions";

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
  const router = useRouter();

  // AJOUT : État pour le filtre
  const [activeFilter, setActiveFilter] = useState<"Event" | "Signalement">("Event");

  const [expandedCommentsId, setExpandedCommentsId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [loadingCommentsFor, setLoadingCommentsFor] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<Record<number, "success" | "error">>({});
  const [participatingStatus, setParticipatingStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [resSpots, resArchived] = await Promise.all([
        getSpotsFromDb() as any,
        getArchivedSpotsFromDb() as any
      ]);

      let allEvents: any[] = [];
      let allSpotsForMap: any[] = [];

      if (resSpots.success) {
        allSpotsForMap = [...resSpots.data];
        // MODIFICATION : On inclut les Signalements dans newsItems
        const activeItems = resSpots.data
          .filter((s: any) => s.type === "Event" || s.type === "Signalement")
          .map((e: any) => ({ ...e, isArchived: false }));
        allEvents = [...activeItems];
      }

      if (resArchived.success) {
        allSpotsForMap = [...allSpotsForMap, ...resArchived.data];
        const archivedItems = resArchived.data
          .filter((s: any) => s.type === "Event" || s.type === "Signalement")
          .map((e: any) => ({ ...e, isArchived: true }));
        allEvents = [...allEvents, ...archivedItems];
      }

      allEvents.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());

      setDbSpots(allSpotsForMap);
      setNewsItems(allEvents);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleEventClick = (item: any) => {
    if (item.latitude && item.longitude) {
      setSelectedSpot({
        ...item,
        _clickTimestamp: Date.now()
      });
    }
  };

  const handleShare = async (item: any) => {
    if (typeof window === "undefined") return;
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/event?spotId=${item.id}`;
    const text = `${item.title ?? "Événement"} - ${item.description ?? ""}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: item.title ?? "Événement CleanSpot", text, url });
        setShareStatus((prev) => ({ ...prev, [item.id]: "success" }));
        return;
      }
    } catch { }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setShareStatus((prev) => ({ ...prev, [item.id]: "success" }));
        return;
      }
    } catch { }
    setShareStatus((prev) => ({ ...prev, [item.id]: "error" }));
  };

  const handleToggleComments = async (spotId: number) => {
    if (expandedCommentsId === spotId) {
      setExpandedCommentsId(null);
      return;
    }
    setExpandedCommentsId(spotId);
    setLoadingCommentsFor(spotId);
    const res = await getComments(spotId);
    if (res.success) setCommentsMap((prev) => ({ ...prev, [spotId]: res.data }));
    setLoadingCommentsFor(null);
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

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Non définie";
    return new Date(dateValue).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleParticipate = async (spotId: number) => {
    const res = await toggleParticipation(spotId, "Anonyme");
    if (res.success) {
      setParticipatingStatus((prev) => ({ ...prev, [spotId]: res.participating ?? false }));
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">

            {/* MODIFICATION : Titre + Boutons de filtre */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-800">Fil d&apos;actualité</h2>
              <div className="inline-flex rounded-lg bg-zinc-100 p-1">
                <button
                  onClick={() => setActiveFilter("Event")}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${activeFilter === "Event" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-500"}`}
                >
                  Événements
                </button>
                <button
                  onClick={() => setActiveFilter("Signalement")}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${activeFilter === "Signalement" ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-500"}`}
                >
                  Signalements
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-teal-500"></div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {newsItems.filter(i => i.type === activeFilter).length > 0 ? (
                  newsItems.filter(i => i.type === activeFilter).map((item) => (
                    <article
                      key={item.id}
                      onClick={() => handleEventClick(item)}
                      className={`overflow-hidden rounded-xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${selectedSpot?.id === item.id ? "border-teal-500 ring-2 ring-teal-500/20" : "border-zinc-200"} bg-white shadow-sm`}
                    >
                      <div className="relative aspect-[5/3] overflow-hidden">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=400&h=240&auto=format&fit=crop"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span className={`absolute left-3 top-3 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white ${item.isArchived ? "bg-emerald-500" : "bg-amber-500"}`}>
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            {item.isArchived ? (
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 012 0v3a1 1 0 11-2 0V5z" clipRule="evenodd" />
                            )}
                          </svg>
                          {item.isArchived ? "Terminé" : "En cours"}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-zinc-800">{item.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{item.description}</p>
                        <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
                          <div className="flex items-center gap-1.5"><span className="font-medium text-zinc-700">Date :</span> {formatDate(item.date || item.createdAt)}</div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400 px-3 py-1.5 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50" onClick={() => handleToggleComments(item.id)}>
                            Commenter
                          </button>
                          {item.type === "Event" && !item.isArchived && (
                            <button type="button" className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${participatingStatus[item.id] ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" : "bg-teal-500 text-white hover:bg-teal-600"}`} onClick={() => handleParticipate(item.id)}>
                              {participatingStatus[item.id] ? "Inscrit" : "Participer"}
                            </button>
                          )}
                        </div>

                        {expandedCommentsId === item.id && (
                          <div className="mt-3 space-y-3 border-t border-zinc-200 pt-3" onClick={(e) => e.stopPropagation()}>
                            {commentsMap[item.id]?.map((c: any) => (
                              <div key={c.id} className="text-xs text-zinc-600"><span className="font-semibold text-zinc-800">{c.author} :</span> {c.content}</div>
                            ))}
                            <div className="flex gap-2">
                              <input type="text" placeholder="Écrire..." value={commentInputs[item.id] ?? ""} onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))} className="flex-1 rounded-lg border px-3 py-1 text-xs outline-none" />
                              <button onClick={() => handleAddComment(item.id)} className="rounded-lg bg-teal-500 px-3 py-1 text-xs text-white">Envoyer</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="col-span-2 py-8 text-center text-zinc-500 italic">Aucun élément disponible.</p>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-800">GreenMap</h2>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap gap-4">
                <span className="flex items-center gap-2 text-sm text-zinc-700"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">🧹</span> Événement</span>
                <span className="flex items-center gap-2 text-sm text-zinc-700"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px]">🚨</span> Signalement</span>
                <span className="flex items-center gap-2 text-sm text-zinc-700"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-white text-[10px]">♻️</span> Point de Tri</span>
              </div>

              {/* CORRECTION : Conteneur de la carte avec isolate et overflow-hidden */}
              <div className="relative aspect-square max-h-[320px] w-full overflow-hidden rounded-lg bg-zinc-200/80 border border-zinc-300 isolate">
                <MapComponent
                  dbSpots={dbSpots}
                  onSelectSpot={setSelectedSpot}
                  selectedSpot={selectedSpot}
                  isDashboard={true}
                />
              </div>
            </div>

            <div className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-zinc-800">Statistiques d&apos;Impact</h2>
              <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="Profil" className="h-14 w-14 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-zinc-800">Score de Points: <span className="text-teal-600">345 pts</span></p>
                  <p className="text-sm text-zinc-600">Gardien de Ville</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}