"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import NavBar from "@/app/components/navbar";
import { getSpotsFromDb, createSpot, updateSpot, deleteSpot } from "@/app/actions/spotActions";
import SpotFormModal from "@/app/components/SpotFormModal";

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

    // CRUD state
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editData, setEditData] = useState<any>(null);
    const [pickingMode, setPickingMode] = useState(false);
    const [pickedPosition, setPickedPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadSpots();
    }, []);

    const loadSpots = async () => {
        const res = await getSpotsFromDb();
        if (res.success) {
            setDbSpots(res.data);
        }
    };

    // --- Handlers CRUD ---
    const handleOpenCreate = () => {
        setFormMode('create');
        setEditData(null);
        setPickedPosition(null);
        setPickingMode(true);
        setShowForm(true);
    };

    const handleOpenEdit = () => {
        if (!selectedSpot) return;
        setFormMode('edit');
        setEditData(selectedSpot);
        setPickedPosition({ lat: selectedSpot.latitude, lng: selectedSpot.longitude });
        setPickingMode(true);
        setShowForm(true);
    };

    const handleFormSubmit = async (data: any) => {
        if (formMode === 'create') {
            await createSpot(data);
        } else if (formMode === 'edit' && editData?.id) {
            await updateSpot(editData.id, data);
        }
        setShowForm(false);
        setPickingMode(false);
        setPickedPosition(null);
        setSelectedSpot(null);
        await loadSpots();
    };

    const handleDelete = async () => {
        if (!selectedSpot?.id) return;
        await deleteSpot(selectedSpot.id);
        setShowDeleteConfirm(false);
        setSelectedSpot(null);
        await loadSpots();
    };

    const handleFormClose = () => {
        setShowForm(false);
        setPickingMode(false);
        setPickedPosition(null);
    };

    const handleMapClick = (lat: number, lng: number) => {
        if (pickingMode) {
            setPickedPosition({ lat, lng });
        }
    };

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
        <div className="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
            {/* NavBar toujours au-dessus */}
            <div className="relative z-[60] flex-shrink-0">
                <NavBar />
            </div>

            {/* Conteneur carte + overlays */}
            <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <MapComponent
                        onSelectSpot={setSelectedSpot}
                        selectedSpot={selectedSpot}
                        dbSpots={filteredSpots}
                        pickingMode={pickingMode}
                        onMapClick={handleMapClick}
                        pickedPosition={pickedPosition}
                    />
                </div>

                {/* Barre de recherche */}
                <div className="absolute top-6 left-8 z-10">
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

                {/* Indicateur de mode sélection */}
                {pickingMode && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
                        <div className="bg-[#1a2f28] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
                            <span className="material-icons-outlined text-[#33a17b]">touch_app</span>
                            <span className="text-sm font-bold">Cliquez sur la carte pour placer le spot</span>
                            <button
                                onClick={() => { setPickingMode(false); setPickedPosition(null); }}
                                className="ml-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                            >
                                <span className="text-xs">✕</span>
                            </button>
                        </div>
                    </div>
                )}


                {/* Panneau de détails du spot sélectionné */}
                {selectedSpot && !showForm && (
                    <div className="absolute inset-y-0 right-0 z-20 flex items-start p-6 pt-6 pointer-events-none">
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

                                {/* Urgence pour Signalement */}
                                {selectedSpot.type === 'Signalement' && selectedSpot.urgency && (
                                    <div className={`rounded-2xl p-3 flex items-center gap-2 ${selectedSpot.urgency === 'Urgent' ? 'bg-rose-50 border border-rose-100' :
                                        selectedSpot.urgency === 'Moyen' ? 'bg-amber-50 border border-amber-100' :
                                            'bg-blue-50 border border-blue-100'
                                        }`}>
                                        <span className="material-icons-outlined text-sm">warning</span>
                                        <span className="text-xs font-bold">Urgence : {selectedSpot.urgency}</span>
                                    </div>
                                )}

                                <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                                    &quot;{selectedSpot.description || selectedSpot.desc || "Aucune description fournie."}&quot;
                                </p>

                                <div className="flex flex-col gap-2 pt-2">
                                    {/* Boutons d'action principaux */}
                                    {selectedSpot.type === 'Event' && (
                                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-3 rounded-2xl shadow-lg shadow-emerald-200 transition-all">
                                            Participer à l&apos;événement
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

                                    {/* Boutons Modifier / Supprimer */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleOpenEdit}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1a2f28] text-white text-[11px] font-bold rounded-xl hover:bg-[#2a453c] transition-all"
                                        >
                                            <span className="material-icons-outlined text-sm">edit</span>
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-xl hover:bg-rose-100 transition-all border border-rose-200"
                                        >
                                            <span className="material-icons-outlined text-sm">delete</span>
                                            Supprimer
                                        </button>
                                    </div>

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

                {/* Modal de confirmation de suppression */}
                {showDeleteConfirm && (
                    <>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" onClick={() => setShowDeleteConfirm(false)} />
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] bg-white rounded-3xl p-8 shadow-2xl w-[400px] text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-outlined text-3xl text-rose-500">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#1a2f28] mb-2">Supprimer ce spot ?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Cette action est irréversible. Le spot &quot;{selectedSpot?.title}&quot; sera définitivement supprimé.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 bg-muted/50 text-[#1a2f28] text-sm font-bold rounded-xl hover:bg-muted transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Modal de formulaire (Création / Édition) */}
                <SpotFormModal
                    isOpen={showForm}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    initialData={editData}
                    mode={formMode}
                    pickedPosition={pickedPosition}
                />
            </div>
        </div>
    );
}