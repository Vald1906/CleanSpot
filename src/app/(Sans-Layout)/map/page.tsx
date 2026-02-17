"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import NavBar from "@/app/components/navbar";

const MapComponent = dynamic(() => import('@/app/components/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-50 flex items-center justify-center">Initialisation de CleanSpot...</div>
});

export default function MapPage() {
    const [selectedSpot, setSelectedSpot] = useState<any>(null);

    return (
        <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans relative">
            <div className="absolute inset-0 z-0">
                <NavBar />
                <MapComponent onSelectSpot={setSelectedSpot} selectedSpot={selectedSpot} />
            </div>

            {/* Header / Barre de recherche minimaliste */}
            <div className="absolute top-20 left-8 z-10">
                <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-sm border border-slate-200/50 flex items-center gap-4 px-6 h-16 w-[400px]">

                    <div className="flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200"></div>

                    <input
                        type="text"
                        placeholder="Explorer Paris..."
                        className="bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400 flex-grow text-sm"
                    />
                </div>
            </div>

            {/* Popup Flottante */}
            {selectedSpot && (
                <div className="absolute inset-y-0 right-0 z-20 flex items-center p-6 pointer-events-none">
                    <aside className="w-[360px] bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col pointer-events-auto animate-in fade-in slide-in-from-right-8 duration-500">

                        {/* Zone Image */}
                        <div className="relative h-48 w-full bg-slate-100">
                            <img
                                src={selectedSpot.image}
                                alt={selectedSpot.title}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedSpot(null)}
                                className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:bg-white transition-all shadow-sm"
                            >
                                <span className="text-xl font-light">×</span>
                            </button>
                        </div>

                        {/* Contenu */}
                        <div className="p-6 flex flex-col gap-4">
                            {/* Auteur */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedSpot.color} ${selectedSpot.accent}`}>
                                        {selectedSpot.type}
                                    </span>
                                    {/* L'adresse */}
                                    <span className="text-[10px] text-slate-400 font-medium truncate italic">
                                        📍 {selectedSpot.address}
                                    </span>
                                </div>

                                <h2 className="text-xl font-semibold text-slate-800 leading-tight">
                                    {selectedSpot.title}
                                </h2>

                                <p className="text-xs text-slate-400 mt-1">
                                    Par <span className="text-slate-600 font-medium">{selectedSpot.author}</span>
                                    {selectedSpot.type !== 'Event' && (
                                        <> • {new Date(selectedSpot.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
                                    )}
                                </p>
                            </div>

                            {/* BLOC SPÉCIFIQUE ÉVÉNEMENT : Date et Heure de rendez-vous */}
                            {selectedSpot.type === 'Event' && (
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-around">
                                    <div className="text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold">Date</p>
                                        <p className="text-sm font-semibold text-emerald-900">
                                            {new Date(selectedSpot.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="w-[1px] h-8 bg-emerald-200/50"></div>
                                    <div className="text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold">Rendez-vous</p>
                                        <p className="text-sm font-semibold text-emerald-900">{selectedSpot.hours}</p>
                                    </div>
                                </div>
                            )}

                            {/* Heures Point de Tri  */}
                            {selectedSpot.type === 'Point de Tri' && selectedSpot.hours && (
                                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 w-fit px-3 py-1 rounded-lg border border-slate-100">
                                    <span className="text-xs">🕒 Accès :</span>
                                    <span className="text-xs font-semibold">{selectedSpot.hours}</span>
                                </div>
                            )}

                            <p className="text-sm text-slate-500 leading-relaxed italic">
                                "{selectedSpot.desc}"
                            </p>

                            {/* Actions Dynamiques */}
                            <div className="flex flex-col gap-2 pt-2">
                                {selectedSpot.type === 'Event' && (
                                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-3 rounded-2xl transition-all">
                                        Participer à l'événement
                                    </button>
                                )}

                                {selectedSpot.type === 'Signalement' && (
                                    <button className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-3 rounded-2xl transition-all">
                                        Dépôt nettoyé ? Signaler ici
                                    </button>
                                )}

                                {selectedSpot.type === 'Point de Tri' && (
                                    <button className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-3 rounded-2xl transition-all flex items-center justify-center gap-2">
                                        Voir l'itinéraire
                                    </button>
                                )}

                                <button className="w-full bg-white border border-slate-200 text-slate-400 text-[10px] font-bold py-2 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">
                                    Partager l'adresse
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}