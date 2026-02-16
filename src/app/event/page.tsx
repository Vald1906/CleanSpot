'use client';

import NavBar from "@/app/components/navbar";

export default function EventPage() {

    return (
        <div className="bg-muted text-foreground min-h-screen">
            <NavBar />
            <main className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar - Filtres */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Type de déchets</h3>
                        <div className="flex flex-wrap gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 bg-[#1a2f28] text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                                <span className="material-icons-outlined text-sm">recycling</span>
                                Plastique
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 bg-white text-muted-foreground border border-muted rounded-lg text-xs font-bold hover:border-primary transition-all">
                                <span className="material-icons-outlined text-sm">local_drink</span>
                                Verre
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 bg-white text-muted-foreground border border-muted rounded-lg text-xs font-bold hover:border-primary transition-all">
                                <span className="material-icons-outlined text-sm">eco</span>
                                Compost
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Distance</h3>
                            <span className="text-xs font-bold text-[#1a2f28]">15 km</span>
                        </div>
                        <input type="range" min="1" max="50" defaultValue="15" className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-[#1a2f28]" />
                        <div className="flex justify-between mt-2 text-[9px] text-muted-foreground font-bold uppercase">
                            <span>1 km</span>
                            <span>50 km</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Date</h3>
                        <div className="bg-white border border-muted rounded-xl p-3 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-[#1a2f28]">Mai 2024</span>
                                <div className="flex gap-1">
                                    <span className="material-icons-outlined text-sm text-muted-foreground cursor-pointer">chevron_left</span>
                                    <span className="material-icons-outlined text-sm text-muted-foreground cursor-pointer">chevron_right</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                    <span key={`${d}-${i}`} className="text-[9px] font-bold text-muted-foreground/50">{d}</span>
                                ))}
                                {[...Array(31)].map((_, i) => (
                                    <span key={i} className={`text-[10px] py-1 rounded-md cursor-pointer hover:bg-muted font-medium ${i + 1 === 12 ? 'bg-[#1a2f28] text-white shadow-md' : 'text-[#1a2f28]'}`}>
                                        {i + 1}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-muted/50 text-[#1a2f28] text-xs font-bold rounded-xl hover:bg-muted transition-all">
                        Réinitialiser les filtres
                    </button>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <h1 className="text-3xl font-bold text-[#1a2f28]">Événements de nettoyage</h1>

                        <div className="relative w-full md:max-w-md">
                            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
                            <input
                                type="text"
                                placeholder="Rechercher un lieu, un parc, une rue..."
                                className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1a2f28]">Prochains événements <span className="text-muted-foreground font-normal text-sm ml-1">(24)</span></h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span>Trier par:</span>
                            <button className="flex items-center gap-1 text-[#1a2f28]">
                                Le plus proche
                                <span className="material-icons-outlined text-sm">expand_more</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Carte 1 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-muted hover:shadow-md transition-shadow group flex flex-col">
                            <div className="relative h-48">
                                <img src="https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=2069&auto=format&fit=crop" alt="Event" className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 bg-white rounded-xl p-2 text-center shadow-md min-w-[50px]">
                                    <span className="block text-[10px] font-bold text-muted-foreground uppercase leading-none">Mai</span>
                                    <span className="block text-xl font-bold text-[#1a2f28] leading-tight">12</span>
                                </div>
                                <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all">
                                    <span className="material-icons-outlined text-xl">favorite_border</span>
                                </button>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground mb-2 flex-wrap">
                                    <span className="material-icons-outlined text-xs">location_on</span>
                                    PARIS, PARC DES BUTTES-CHAUMONT
                                </div>
                                <h3 className="text-lg font-bold text-[#1a2f28] mb-2 group-hover:text-[#33a17b] transition-colors leading-tight">Grande collecte printanière</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    Rejoignez-nous pour une matinée dédiée à la préservation de notre parc. On se concentre sur les zones de pique-nique...
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/50">
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                            <span className="material-icons-outlined text-[10px]">recycling</span>
                                            Plastique
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                            <span className="material-icons-outlined text-[10px]">local_drink</span>
                                            Verre
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-[#1a2f28] text-white text-xs font-bold rounded-xl hover:bg-[#2a453c] transition-all shadow-sm">
                                        Participer
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Carte 2 */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-muted hover:shadow-md transition-shadow group flex flex-col">
                            <div className="relative h-48">
                                <img src="https://images.unsplash.com/photo-1574689232449-396a4b9c7325?q=80&w=2072&auto=format&fit=crop" alt="Event" className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 bg-white rounded-xl p-2 text-center shadow-md min-w-[50px]">
                                    <span className="block text-[10px] font-bold text-muted-foreground uppercase leading-none">Mai</span>
                                    <span className="block text-xl font-bold text-[#1a2f28] leading-tight">15</span>
                                </div>
                                <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all">
                                    <span className="material-icons-outlined text-xl">favorite_border</span>
                                </button>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground mb-2 flex-wrap">
                                    <span className="material-icons-outlined text-xs">location_on</span>
                                    PANTIN, CANAL DE L'OURCQ
                                </div>
                                <h3 className="text-lg font-bold text-[#1a2f28] mb-2 group-hover:text-[#33a17b] transition-colors leading-tight">Opération Rives Propres</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    Nettoyage intensif des berges du canal. Gants et sacs fournis. Café offert à tous les bénévoles !
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/50">
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                            <span className="material-icons-outlined text-[10px]">recycling</span>
                                            Plastique
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                            <span className="material-icons-outlined text-[10px]">eco</span>
                                            Compost
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-[#1a2f28] text-white text-xs font-bold rounded-xl hover:bg-[#2a453c] transition-all shadow-sm">
                                        Participer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
