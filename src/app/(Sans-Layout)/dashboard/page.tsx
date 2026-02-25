"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/components/navbar";
import { getSpotsFromDb, getComments, addComment, toggleParticipation } from "@/app/actions/spotActions";

const mapMarkers = [
  { type: "verre" as const, x: 15, y: 20 },
  { type: "verre" as const, x: 45, y: 35 },
  { type: "verre" as const, x: 70, y: 55 },
  { type: "compost" as const, x: 25, y: 60 },
  { type: "compost" as const, x: 55, y: 25 },
  { type: "compost" as const, x: 80, y: 40 },
  { type: "evenement" as const, x: 35, y: 45 },
  { type: "evenement" as const, x: 60, y: 70 },
];

export default function DashboardPage() {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [expandedCommentsId, setExpandedCommentsId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [loadingCommentsFor, setLoadingCommentsFor] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<
    Record<number, "success" | "error">
  >({});
  const [participatingStatus, setParticipatingStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadData() {
      const res = await getSpotsFromDb();
      if (res.success) {
        // On récupère uniquement les événements pour le fil d'actualité
        const events = res.data.filter((s: any) => s.type === "Event");
        setNewsItems(events);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleShare = async (item: any) => {
    if (typeof window === "undefined") return;

    const baseUrl = window.location.origin;
    const url = `${baseUrl}/event?spotId=${item.id}`;
    const text = `${item.title ?? "Événement"} - ${item.description ?? ""}`;

    // 1) Tentative de partage natif (mobile / navigateurs récents)
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title ?? "Événement CleanSpot",
          text,
          url,
        });
        setShareStatus((prev) => ({ ...prev, [item.id]: "success" }));
        return;
      }
    } catch {
      // On continue avec les fallbacks
    }

    // 2) Tentative de copie via Clipboard API (contexte sécurisé)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setShareStatus((prev) => ({ ...prev, [item.id]: "success" }));
        return;
      }
    } catch {
      // On essaie un fallback plus ancien
    }

    // 3) Fallback DOM: textarea + document.execCommand("copy") (marche aussi en HTTP)
    try {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (successful) {
        setShareStatus((prev) => ({ ...prev, [item.id]: "success" }));
        return;
      }
    } catch {
      // ignore, on passera à l'erreur générale
    }

    // Si absolument rien ne fonctionne
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
    if (res.success) {
      setCommentsMap((prev) => ({ ...prev, [spotId]: res.data }));
    }
    setLoadingCommentsFor(null);
  };

  const handleAddComment = async (spotId: number) => {
    const value = (commentInputs[spotId] ?? "").trim();
    if (!value) return;

    const res = await addComment(spotId, "Anonyme", value);
    if (res.success) {
      setCommentInputs((prev) => ({ ...prev, [spotId]: "" }));
      const refreshed = await getComments(spotId);
      if (refreshed.success) {
        setCommentsMap((prev) => ({ ...prev, [spotId]: refreshed.data }));
      }
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Non définie";
    const d = new Date(dateValue);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleParticipate = async (spotId: number) => {
    // On utilise un nom par défaut pour l'instant ou on pourrait gérer une session
    const res = await toggleParticipation(spotId, "Anonyme");
    if (res.success) {
      setParticipatingStatus((prev) => ({
        ...prev,
        [spotId]: res.participating ?? false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Fil d'actualité - 2 colonnes */}
          <section className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-zinc-800">
              Fil d&apos;actualité
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-teal-500"></div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {newsItems.length > 0 ? (
                  newsItems.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[5/3] overflow-hidden">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=400&h=240&auto=format&fit=crop"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span
                          className="absolute left-3 top-3 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white bg-amber-500"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 012 0v3a1 1 0 11-2 0V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          En cours
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-zinc-800">
                          {item.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                          {item.description}
                        </p>
                        <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-zinc-700">Début :</span>
                            {formatDate(item.date)}
                          </div>
                          {item.dateFin && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-zinc-700">Fin :</span>
                              {formatDate(item.dateFin)}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400 px-3 py-1.5 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50"
                            onClick={() => handleToggleComments(item.id)}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            Commenter
                          </button>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${participatingStatus[item.id]
                              ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                              : "bg-teal-500 text-white hover:bg-teal-600"
                              }`}
                            onClick={() => handleParticipate(item.id)}
                          >
                            {participatingStatus[item.id] ? "Inscrit" : "Participer"}
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                            aria-label="Partager"
                            onClick={() => handleShare(item)}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                          </button>
                        </div>
                        {shareStatus[item.id] === "success" && (
                          <p className="mt-1 text-[11px] font-medium text-teal-600">
                            Lien de l&apos;événement prêt à être partagé.
                          </p>
                        )}
                        {shareStatus[item.id] === "error" && (
                          <p className="mt-1 text-[11px] font-medium text-rose-600">
                            Le partage n&apos;est pas supporté sur ce navigateur.
                          </p>
                        )}
                        {expandedCommentsId === item.id && (
                          <div className="mt-3 space-y-3 border-t border-zinc-200 pt-3">
                            {loadingCommentsFor === item.id ? (
                              <p className="text-xs italic text-zinc-500">
                                Chargement des commentaires...
                              </p>
                            ) : (
                              <>
                                {(!commentsMap[item.id] ||
                                  commentsMap[item.id].length === 0) && (
                                    <p className="text-xs italic text-zinc-400">
                                      Aucun commentaire pour le moment.
                                    </p>
                                  )}
                                {commentsMap[item.id] &&
                                  commentsMap[item.id].map((c: any) => (
                                    <div
                                      key={c.id}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                                        {c.author?.[0]?.toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs font-semibold text-zinc-800">
                                          {c.author}
                                          {c.createdAt && (
                                            <span className="ml-2 text-[11px] font-normal text-zinc-400">
                                              {new Date(
                                                c.createdAt
                                              ).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                              })}
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-xs text-zinc-600">
                                          {c.content}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </>
                            )}
                            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                              <input
                                type="text"
                                placeholder="Écrire un commentaire..."
                                value={commentInputs[item.id] ?? ""}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleAddComment(item.id)
                                }
                                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddComment(item.id)}
                                disabled={!((commentInputs[item.id] ?? "").trim())}
                                className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50"
                              >
                                Envoyer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="col-span-2 py-8 text-center text-zinc-500 italic">
                    Aucun événement récent.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* GreenMap */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-800">
              GreenMap
            </h2>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap gap-4">
                <span className="flex items-center gap-2 text-sm text-zinc-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </span>
                  Verre
                </span>
                <span className="flex items-center gap-2 text-sm text-zinc-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 16H5V5h14v14z" />
                    </svg>
                  </span>
                  Compost
                </span>
                <span className="flex items-center gap-2 text-sm text-zinc-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                    <span className="text-xs font-bold">!</span>
                  </span>
                  Événement
                </span>
              </div>
              <div className="relative aspect-square max-h-[320px] w-full overflow-hidden rounded-lg bg-zinc-200/80">
                {/* Grille style carte */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #a3a3a3 1px, transparent 1px),
                      linear-gradient(to bottom, #a3a3a3 1px, transparent 1px)
                    `,
                    backgroundSize: "10% 10%",
                  }}
                />
                {/* Zones vertes */}
                <div
                  className="absolute bottom-[10%] left-[15%] h-[25%] w-[30%] rounded bg-emerald-200/60"
                  aria-hidden
                />
                <div
                  className="absolute right-[20%] top-[20%] h-[20%] w-[25%] rounded bg-emerald-200/60"
                  aria-hidden
                />
                {/* Marqueurs */}
                {mapMarkers.map((m, i) => (
                  <div
                    key={i}
                    className="absolute flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow-md"
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      transform: "translate(-50%, -50%)",
                      backgroundColor:
                        m.type === "verre"
                          ? "#3b82f6"
                          : m.type === "compost"
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  >
                    {m.type === "verre" ? (
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 2v2h2v4H6v2h2v8h8v-8h2v-2h-2V4h2V2H6zm10 4v2h2v4h-2v6h-4v-6H8v-4h2V6h6z" />
                      </svg>
                    ) : m.type === "compost" ? (
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 16H5V5h14v14z" />
                      </svg>
                    ) : (
                      <span className="text-sm font-bold">!</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques d'Impact */}
            <div className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-zinc-800">
                Statistiques d&apos;Impact
              </h2>
              <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-zinc-800">
                    Score de Points: <span className="text-teal-600">345 pts</span>
                  </p>
                  <p className="text-sm text-zinc-600">Gardien de Ville</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
