'use client';

import { useState, useEffect } from 'react';
import NavBar from "@/app/components/navbar";
import { getSpotsFromDb, createSpot } from "@/app/actions/spotActions";
import SpotFormModal from "@/app/components/SpotFormModal";

export default function EventPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        const res = await getSpotsFromDb();
        if (res.success) {
            // Filtrer uniquement les événements
            setEvents(res.data.filter((s: any) => s.type === 'Event'));
        }
        setLoading(false);
    };

    const handleCreateSpot = async (data: any) => {
        await createSpot(data);
        setShowForm(false);
        await loadEvents();
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return { month: '', day: '' };
        const d = new Date(dateStr);
        return {
            month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
            day: d.getDate().toString(),
        };
    };

    // Tags de déchets aléatoires pour la démo
    const wasteTags = [
        [
            { label: 'Plastique', icon: 'recycling', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Verre', icon: 'local_drink', bg: 'bg-orange-50', text: 'text-orange-600' },
        ],
        [
            { label: 'Plastique', icon: 'recycling', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Compost', icon: 'eco', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        ],
        [
            { label: 'Autre', icon: 'delete', bg: 'bg-purple-50', text: 'text-purple-600' },
        ],
    ];

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

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:max-w-md">
                                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
                                <input
                                    type="text"
                                    placeholder="Rechercher un lieu, un parc, une rue..."
                                    className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1a2f28]">
                            Événements <span className="text-muted-foreground font-normal text-sm ml-1">({events.length})</span>
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span>Trier par:</span>
                            <button className="flex items-center gap-1 text-[#1a2f28]">
                                Le plus proche
                                <span className="material-icons-outlined text-sm">expand_more</span>
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-3 border-[#1a2f28]/20 border-t-[#1a2f28] rounded-full animate-spin"></div>
                                <p className="text-sm text-muted-foreground">Chargement des événements...</p>
                            </div>
                        </div>
                    )}

                    {/* Grille d'événements */}
                    {!loading && events.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {events.map((event, index) => {
                                const { month, day } = formatDate(event.date);
                                const tags = wasteTags[index % wasteTags.length];

                                return (
                                    <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-muted hover:shadow-md transition-shadow group flex flex-col">
                                        <div className="relative h-48">
                                            <img
                                                src={event.image || `https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=600&auto=format&fit=crop`}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {month && (
                                                <div className="absolute top-4 left-4 bg-white rounded-xl p-2 text-center shadow-md min-w-[50px]">
                                                    <span className="block text-[10px] font-bold text-muted-foreground uppercase leading-none">{month}</span>
                                                    <span className="block text-xl font-bold text-[#1a2f28] leading-tight">{day}</span>
                                                </div>
                                            )}
                                            <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all">
                                                <span className="material-icons-outlined text-xl">favorite_border</span>
                                            </button>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground mb-2 flex-wrap">
                                                <span className="material-icons-outlined text-xs">location_on</span>
                                                {event.address?.toUpperCase()?.slice(0, 40) || 'ADRESSE NON RENSEIGNÉE'}
                                            </div>
                                            <h3 className="text-lg font-bold text-[#1a2f28] mb-2 group-hover:text-[#33a17b] transition-colors leading-tight">
                                                {event.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {event.description || 'Aucune description disponible.'}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/50">
                                                <div className="flex gap-2">
                                                    {tags.map((tag, i) => (
                                                        <div key={i} className={`flex items-center gap-1 px-2 py-0.5 ${tag.bg} ${tag.text} rounded-md text-[9px] font-bold uppercase tracking-wider`}>
                                                            <span className="material-icons-outlined text-[10px]">{tag.icon}</span>
                                                            {tag.label}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="px-5 py-2.5 bg-[#1a2f28] text-white text-xs font-bold rounded-xl hover:bg-[#2a453c] transition-all shadow-sm">
                                                    Participer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* État vide */}
                    {!loading && events.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
                                <span className="material-icons-outlined text-4xl text-muted-foreground">event_busy</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#1a2f28] mb-2">Aucun événement pour le moment</h3>
                            <p className="text-sm text-muted-foreground">Cliquez sur le bouton + pour créer un spot !</p>
                        </div>
                    )}

                    {/* Bouton charger plus */}
                    {!loading && events.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button className="px-8 py-3 bg-white border border-muted text-[#1a2f28] text-sm font-bold rounded-2xl hover:bg-muted/50 transition-all shadow-sm">
                                Charger plus d&apos;événements
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Bouton FAB flottant pour créer un spot */}
            <div className="fixed bottom-8 right-8 z-30">
                <button
                    onClick={() => setShowForm(true)}
                    className="group w-16 h-16 bg-[#1a2f28] hover:bg-[#2a453c] text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_10px_40px_rgba(26,47,40,0.4)]"
                >
                    <span className="material-icons-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
                </button>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#33a17b] rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-[8px] font-bold">NEW</span>
                </div>
            </div>

            {/* Modal de création de spot */}
            <SpotFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreateSpot}
                mode="create"
                initialData={undefined}
                pickedPosition={null}
            />
        </div>
    );
}
