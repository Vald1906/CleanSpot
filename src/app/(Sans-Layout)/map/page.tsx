"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import NavBar from "@/app/components/navbar";
import { getSpotsFromDb, createSpot, updateSpot, deleteSpot, toggleParticipation, toggleFavorite, getComments, addComment, getParticipations } from "@/app/actions/spotActions";
import SpotFormModal from "@/app/components/SpotFormModal";
import { useNotification } from "@/app/context/NotificationContext";

const user = {
    name: "Jean Dupont",
    role: "admin"
};

const MATERIAL_VISUALS: Record<string, { icon: string; bg: string; text: string }> = {
    'Plastique': { icon: 'recycling', bg: 'bg-blue-50', text: 'text-blue-600' },
    'Verre': { icon: 'local_drink', bg: 'bg-orange-50', text: 'text-orange-600' },
    'Compost': { icon: 'eco', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    'Papier/Carton': { icon: 'description', bg: 'bg-amber-50', text: 'text-amber-600' },
    'Métaux': { icon: 'settings', bg: 'bg-slate-100', text: 'text-slate-600' },
    'Textile': { icon: 'checkroom', bg: 'bg-pink-50', text: 'text-pink-600' },
    'Autre': { icon: 'delete', bg: 'bg-purple-50', text: 'text-purple-600' },
};

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

    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editData, setEditData] = useState<any>(null);
    const [pickingMode, setPickingMode] = useState(false);
    const [pickedPosition, setPickedPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [isParticipating, setIsParticipating] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [spotComments, setSpotComments] = useState<any[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [commentAuthor, setCommentAuthor] = useState('');
    const [userName] = useState('Utilisateur');
    const { showNotification } = useNotification();

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
            const res = await createSpot(data);
            if (res.success) {
                const typeLabel = data.type === 'Event' ? 'Événement' : 'Signalement';
                showNotification(`${typeLabel} créé avec succès !`, "success");
            } else {
                showNotification("Erreur lors de la création du spot.", "error");
            }
        } else if (formMode === 'edit' && editData?.id) {
            const res = await updateSpot(editData.id, data);
            if (res.success) {
                const typeLabel = data.type === 'Event' ? 'Événement' : 'Signalement';
                showNotification(`${typeLabel} modifié avec succès !`, "success");
            } else {
                showNotification("Erreur lors de la modification du spot.", "error");
            }
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

    // --- Correction de la fonction de copie ---
    const handleCopyAddress = (address: string) => {
        if (!address) return;
        if (typeof window !== 'undefined' && navigator.clipboard && window.isSecureContext) {
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
        if (typeof document === 'undefined') return;
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
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

    // --- Social Handlers ---
    const loadSpotSocial = async (spotId: number) => {
        const pRes = await getParticipations(spotId);
        if (pRes.success) {
            setParticipantCount(pRes.count ?? 0);
            setIsParticipating((pRes.data ?? []).some((p: any) => p.userName === userName));
        }
        const cRes = await getComments(spotId);
        if (cRes.success) {
            setSpotComments(cRes.data);
        }
    };

    const handleSelectSpot = (spot: any) => {
        setSelectedSpot(spot);
        setShowComments(false);
        setCommentInput('');
        loadSpotSocial(spot.id);
    };

    const handleParticipateMap = async () => {
        if (!selectedSpot) return;
        const res = await toggleParticipation(selectedSpot.id, userName);
        if (res.success) {
            setIsParticipating(res.participating ?? false);
            setParticipantCount(prev => prev + (res.participating ? 1 : -1));
        }
    };

    const handleFavoriteMap = async () => {
        if (!selectedSpot) return;
        const res = await toggleFavorite(selectedSpot.id, userName);
        if (res.success) {
            setIsFavorited(res.favorited ?? false);
        }
    };

    const handleAddCommentMap = async () => {
        if (!selectedSpot || !commentInput.trim() || !commentAuthor.trim()) return;
        const res = await addComment(selectedSpot.id, commentAuthor, commentInput);
        if (res.success) {
            setCommentInput('');
            const cRes = await getComments(selectedSpot.id);
            if (cRes.success) setSpotComments(cRes.data);
        }
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
            <div className="relative z-[60] flex-shrink-0">
                <NavBar />
            </div>

            <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <MapComponent
                        onSelectSpot={handleSelectSpot}
                        selectedSpot={selectedSpot}
                        dbSpots={filteredSpots}
                        pickingMode={pickingMode}
                        onMapClick={handleMapClick}
                        pickedPosition={pickedPosition}
                    />
                </div>

                {/* Barre de recherche */}
                <div className="absolute top-6 left-8 z-10 flex flex-col gap-2">
                    <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 flex items-center gap-4 px-6 h-16 w-[400px] transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <div className="h-6 w-[1px] bg-slate-200"></div>
                        <input
                            type="text"
                            placeholder="Rechercher un lieu..."
                            className="bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400 flex-grow text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Liste des résultats (Suggestions) */}
                    {searchQuery.length > 0 && (
                        <div className="w-[400px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
                                {filteredSpots.length > 0 ? (
                                    filteredSpots.map((spot) => (
                                        <button
                                            key={spot.id}
                                            onClick={() => {
                                                handleSelectSpot(spot);
                                                setSearchQuery(""); // Optionnel : vide la recherche après sélection
                                            }}
                                            className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl group-hover:bg-emerald-100 transition-colors">
                                                {spot.type === 'Event' ? '🧹' : spot.type === 'Signalement' ? '🚨' : '♻️'}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-semibold text-slate-700 truncate">{spot.title}</span>
                                                <span className="text-xs text-slate-400 truncate">{spot.address}</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-slate-400 italic">
                                        Aucun lieu trouvé...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Panneau de détails */}
                {selectedSpot && !showForm && (() => {
                    const materials: string[] = selectedSpot.materials ? (typeof selectedSpot.materials === 'string' ? JSON.parse(selectedSpot.materials) : selectedSpot.materials) : [];
                    return (
                        <div className="absolute inset-y-0 right-0 z-20 flex items-start p-6 pt-6 pointer-events-none">
                            <aside className="w-[360px] max-h-[calc(100vh-120px)] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-y-auto flex flex-col pointer-events-auto animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="relative h-48 w-full bg-slate-100 flex-shrink-0">
                                    <img
                                        src={selectedSpot.image || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400"}
                                        alt={selectedSpot.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => setSelectedSpot(null)}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all shadow-md"
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>

                                <div className="p-6 flex flex-col gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-800">{selectedSpot.title}</h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Posté par <span className="text-slate-600 font-medium">{selectedSpot.author}</span>
                                        </p>
                                    </div>

                                    <p className="text-sm text-slate-500 italic">
                                        &quot;{selectedSpot.description || "Aucune description."}&quot;
                                    </p>

                                    <div className="flex flex-col gap-2 pt-2">
                                        {/* Boutons Sociaux */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleParticipateMap}
                                                className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${isParticipating
                                                    ? 'bg-[#33a17b] text-white shadow-lg shadow-emerald-200'
                                                    : (!isParticipating && selectedSpot.maxParticipants > 0 && participantCount >= selectedSpot.maxParticipants)
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200'
                                                    }`}
                                                disabled={!isParticipating && selectedSpot.maxParticipants > 0 && participantCount >= selectedSpot.maxParticipants}
                                            >
                                                <span className="material-icons-outlined text-sm">{isParticipating ? 'check_circle' : (!isParticipating && selectedSpot.maxParticipants > 0 && participantCount >= selectedSpot.maxParticipants) ? 'block' : 'group_add'}</span>
                                                {isParticipating ? 'Inscrit !' : (selectedSpot.maxParticipants > 0 && participantCount >= selectedSpot.maxParticipants) ? 'Complet' : 'Participer'}
                                                {participantCount > 0 && (
                                                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px]">{participantCount}</span>
                                                )}
                                            </button>
                                            <button onClick={() => setShowComments(!showComments)} className="px-4 py-3 bg-slate-100 rounded-2xl">
                                                <span className="material-icons-outlined text-sm">chat_bubble_outline</span>
                                            </button>
                                        </div>

                                        {/* Boutons d'Administration / Auteur */}
                                        <div className="flex gap-2 border-t border-slate-50 pt-2">
                                            {/* Modifier : Seulement Admin */}
                                            {user.role === 'admin' && (
                                                <button
                                                    onClick={handleOpenEdit}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1a2f28] text-white text-[11px] font-bold rounded-xl hover:bg-[#2a453c] transition-all"
                                                >
                                                    <span className="material-icons-outlined text-sm">edit</span>
                                                    Modifier
                                                </button>
                                            )}

                                            {/* Supprimer : Admin OU Créateur du spot */}
                                            {(user.role === 'admin' || user.name === selectedSpot.author) && (
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-xl hover:bg-rose-100 transition-all border border-rose-200"
                                                >
                                                    <span className="material-icons-outlined text-sm">delete</span>
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleCopyAddress(selectedSpot.address)}
                                            className={`w-full border text-[10px] font-bold py-2 rounded-xl transition-all uppercase ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-400'}`}
                                        >
                                            {copied ? 'Adresse copiée !' : "Copier l'adresse"}
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    );
                })()}

                {/* Modals de confirmation et formulaire */}
                {showDeleteConfirm && (
                    <>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" onClick={() => setShowDeleteConfirm(false)} />
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] bg-white rounded-3xl p-8 shadow-2xl w-[400px] text-center">
                            <h3 className="text-lg font-bold mb-2">Supprimer ce spot ?</h3>
                            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Annuler</button>
                                <button onClick={handleDelete} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold">Supprimer</button>
                            </div>
                        </div>
                    </>
                )}

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