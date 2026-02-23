"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import NavBar from "@/app/components/navbar";
import { getSpotsFromDb } from "@/app/actions/spotActions";

const MapComponent = dynamic(() => import('@/app/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-50 flex items-center justify-center">
            <p className="text-slate-400 animate-pulse font-medium">Initialisation de CleanSpot...</p>
        </div>
    )
});

export default function MapPage() {
    const [selectedSpot, setSelectedSpot] = useState<any>(null);
    const [dbSpots, setDbSpots] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
        const loadData = async () => {
            const res = await getSpotsFromDb();
            if (res.success) {
                setDbSpots(res.data);
            }
        };
        loadData();
    }, []);

    const handleCopyAddress = (address: string) => {
        if (!address) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(address)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(() => fallbackCopy(address));
        } else {
            fallbackCopy(address);
        }
    };

    const fallbackCopy = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Impossible de copier", err);
        }
        document.body.removeChild(textArea);
    };

    // Filtrage optimisé (Calculé à chaque changement de searchQuery)
    const filteredSpots = useMemo(() => {
        const searchLower = searchQuery.toLowerCase();
        return dbSpots.filter((spot) => (
            spot.title?.toLowerCase().includes(searchLower) ||
            spot.address?.toLowerCase().includes(searchLower) ||
            spot.type?.toLowerCase().includes(searchLower)
        ));
    }, [searchQuery, dbSpots]);

    if (!mounted) return null;

    return (
        <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans relative">
            <div className="absolute inset-0 z-0">
                <NavBar />
                {/* Suppression de la KEY dynamique pour éviter le reset à Paris */}
                <MapComponent
                    onSelectSpot={setSelectedSpot}
                    selectedSpot={selectedSpot}
                    dbSpots={filteredSpots}
                />
            </div>

            {/* Ton UI de recherche d'origine */}
            <div className="absolute top-24 left-8 z-10">
                <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 flex items-center gap-4 px-6 h-16 w-[400px] transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
                    <div className="flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-200"></div>
                    <input
                        type="text"
                        placeholder="Rechercher un lieu, un événement..."
                        className="bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400 flex-grow text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Ton ASIDE de détails d'origine complet */}
            {selectedSpot && (
                <div className="absolute inset-y-0 right-0 z-20 flex items-start p-6 pt-32 pointer-events-none">
                    <aside className="w-[360px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col pointer-events-auto animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="relative h-48 w-full bg-slate-100">
                            <img
                                src={selectedSpot.image || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400"}
                                alt={selectedSpot.title}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedSpot(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all shadow-md"
                            >
                                <span className="text-2xl font-light">×</span>
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedSpot.color || 'bg-slate-100'} ${selectedSpot.accent || 'text-slate-600'}`}>
                                        {selectedSpot.type}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium truncate italic max-w-[180px]">
                                        📍 {selectedSpot.address}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 leading-tight">{selectedSpot.title}</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Posté par <span className="text-slate-600 font-medium">{selectedSpot.author}</span>
                                    {selectedSpot.date && (
                                        <> • {new Date(selectedSpot.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
                                    )}
                                </p>
                            </div>

                            {/* Section spécifique Event */}
                            {selectedSpot.type === 'Event' && selectedSpot.date && (
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-around">
                                    <div className="text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold">Date</p>
                                        <p className="text-sm font-semibold text-emerald-900">
                                            {new Date(selectedSpot.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="w-[1px] h-8 bg-emerald-200/50"></div>
                                    <div className="text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold">Heure</p>
                                        <p className="text-sm font-semibold text-emerald-900">{selectedSpot.hours || "14:00"}</p>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                                "{selectedSpot.description || selectedSpot.desc || "Aucune description fournie."}"
                            </p>

                            <div className="flex flex-col gap-2 pt-2">
                                {selectedSpot.type === 'Event' && (
                                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-3 rounded-2xl shadow-lg shadow-emerald-200 transition-all">
                                        Participer à l'événement
                                    </button>
                                )}
                                {selectedSpot.type === 'Signalement' && (
                                    <button className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-3 rounded-2xl shadow-lg shadow-rose-200 transition-all">
                                        Signaler comme résolu
                                    </button>
                                )}
                                {selectedSpot.type === 'Point de Tri' && (
                                    <button className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-3 rounded-2xl transition-all">
                                        Y aller maintenant
                                    </button>
                                )}
                                <button
                                    onClick={() => handleCopyAddress(selectedSpot.address)}
                                    className={`w-full border text-[10px] font-bold py-2 rounded-xl transition-all uppercase tracking-widest ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {copied ? 'Adresse copiée !' : "Copier l'adresse"}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}