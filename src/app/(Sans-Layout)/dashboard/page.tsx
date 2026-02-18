"use client";

import NavBar from "@/app/components/navbar";

const newsItems = [
  {
    id: 1,
    title: "Opération Canal Saint-Martin",
    description:
      "Lié à l'évènement dont vous avez entendu se passer le d'être dans plusieurs lieux et de sa versatilité.",
    hashtag: "#ProjetsParis",
    status: "Nettoyé" as const,
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=240&fit=crop",
  },
  {
    id: 2,
    title: "Opération Canal Saint-Martin",
    description:
      "Lee témoirement une souverit permet suivent esserans mondiale se simplethoirement pull avoraut en tesserans.",
    hashtag: "#ProjetsParis",
    status: "En cours" as const,
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=240&fit=crop",
  },
];

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
            <div className="grid gap-4 sm:grid-cols-2">
              {newsItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[5/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute left-3 top-3 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white ${
                        item.status === "Nettoyé"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    >
                      {item.status === "Nettoyé" ? (
                        <svg
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
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
                      )}
                      {item.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-800">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                      {item.description}
                    </p>
                    <span className="mt-2 inline-block text-sm text-teal-600">
                      {item.hashtag}
                    </span>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400 px-3 py-1.5 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50"
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
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        Soutenir
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400 px-3 py-1.5 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50"
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-600"
                      >
                        Participer
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                        aria-label="Partager"
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
                  </div>
                </article>
              ))}
            </div>
            <h2 className="mb-4 mt-8 text-xl font-semibold text-zinc-800">
              Fil d&apos;actualité
            </h2>
            <p className="text-sm text-zinc-500">
              Plus d&apos;événements à venir dans votre fil.
            </p>
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
