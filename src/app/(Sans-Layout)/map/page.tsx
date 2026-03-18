"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";
import NavBar from "@/app/components/navbar";
import {
    getSpotsFromDb,
    createSpot,
    updateSpot,
    deleteSpot,
    toggleParticipation,
    getComments,
    addComment,
    getParticipations,
    archiveSpot,
    toggleFavorite
} from "@/app/actions/spotActions";
import SpotFormModal from "@/app/components/SpotFormModal";
import { useNotification } from "@/app/context/NotificationContext";

const MapComponent = dynamic(() => import('@/app/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-50 flex items-center justify-center">
            <p className="text-slate-400 animate-pulse font-medium">Initialisation de CleanSpot...</p>
        </div>
    )
});

export default function MapPage() {
    const { data: session } = useSession();
    const user = session?.user;

    // Mise à jour du format : "ID - PRENOM NOM"
    const userFullIdentity = useMemo(() => {
        if (!user) return null;
        const id = (user as any).id || "N/A";
        const name = user.name || "Anonyme";
        return `${id} - ${name}`;
    }, [user]);

    const [selectedSpot, setSelectedSpot] = useState<any>(null);
    const [dbSpots, setDbSpots] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

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
    const [commentInput, setCommentInput] = useState('');
    const { showNotification } = useNotification();

    useEffect(() => {
        setMounted(true);
        loadSpots();
    }, []);

    const loadSpots = async () => {
        const res = await getSpotsFromDb();

        if (res.success && res.data) {
            setDbSpots(res.data);

            // SYNCHRONISATION CRUCIALE
            // Si l'utilisateur a déjà un spot ouvert dans le panneau latéral au moment du refresh
            if (selectedSpot && userFullIdentity) {
                // On cherche la version "fraîche" de ce spot dans les données reçues
                const freshSpot = res.data.find((s: any) => s.id === selectedSpot.id);

                if (freshSpot) {
                    // On met à jour le compteur et l'état du bouton avec les données DB
                    const participants = freshSpot.participants || [];
                    const favorites = freshSpot.favorites || [];
                    
                    setParticipantCount(participants.length);
                    setIsParticipating(participants.includes(userFullIdentity));
                    setIsFavorited(favorites.includes(userFullIdentity));

                    // On met aussi à jour l'objet selectedSpot lui-même pour garder la cohérence
                    setSelectedSpot(freshSpot);
                }
            }
        }
    };

    const isOwner = useCallback((spot: any) => {
        return spot && userFullIdentity && spot.author === userFullIdentity;
    }, [userFullIdentity]);

    const filteredSuggestions = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return dbSpots.filter(spot =>
            spot.title?.toLowerCase().includes(lowerQuery) ||
            spot.address?.toLowerCase().includes(lowerQuery) ||
            spot.type?.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);
    }, [searchQuery, dbSpots]);

    const handleSelectSpot = (spot: any) => {
        setSelectedSpot(spot);
        setSearchQuery("");

        // --- SYNCHRONISATION INSTANTANÉE ---
        // On utilise les données déjà présentes dans l'objet 'spot' 
        // qui viennent de ton nouveau getSpotsFromDb
        const participants = spot.participants || [];
        const favorites = spot.favorites || [];

        setParticipantCount(participants.length);
        setIsParticipating(userFullIdentity ? participants.includes(userFullIdentity) : false);
        setIsFavorited(userFullIdentity ? favorites.includes(userFullIdentity) : false);
        // ------------------------------------

        // On ne charge plus que les commentaires (car ils sont nombreux et changent souvent)
        loadComments(spot.id);
    };

    // Remplace loadSpotSocial par loadComments pour plus de clarté
    const loadComments = async (spotId: number) => {
        const cRes = await getComments(spotId);
        if (cRes.success) setSpotComments(cRes.data);
    };

    const handleOpenEdit = () => {
        if (!isOwner(selectedSpot)) return;
        setFormMode('edit');
        setEditData(selectedSpot);
        setPickedPosition({ lat: selectedSpot.latitude, lng: selectedSpot.longitude });
        setPickingMode(true);
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!isOwner(selectedSpot)) return;
        const res = await deleteSpot(selectedSpot.id);
        if (res.success) {
            showNotification("Supprimé avec succès", "success");
            setShowDeleteConfirm(false);
            setSelectedSpot(null);
            loadSpots();
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (!userFullIdentity) return showNotification("Connectez-vous pour continuer", "error");

        const payload = { ...data, author: userFullIdentity };
        if (formMode === 'create') {
            await createSpot(payload);
            showNotification("Créé avec succès", "success");
        } else {
            await updateSpot(editData.id, payload);
            showNotification("Modifié avec succès", "success");
        }
        setShowForm(false);
        setPickingMode(false);
        setSelectedSpot(null);
        loadSpots();
    };

    const loadSpotSocial = async (spotId: number) => {
        const pRes = await getParticipations(spotId);
        if (pRes.success) {
            setParticipantCount(pRes.count ?? 0);
            setIsParticipating(userFullIdentity ? (pRes.data ?? []).some((p: any) => p.user_name === userFullIdentity) : false);
        }
        const cRes = await getComments(spotId);
        if (cRes.success) setSpotComments(cRes.data);
    };

    const handleParticipateMap = async () => {
        if (!selectedSpot || !userFullIdentity) {
            return showNotification("Connectez-vous pour participer", "error");
        }

        if (!isParticipating && selectedSpot.type === "Signalement" && participantCount >= 5) {
            showNotification("Limite de 5 participants atteinte.", "error");
            return;
        }

        const res = await toggleParticipation(selectedSpot.id, userFullIdentity,);
        if (res.success) {
            setIsParticipating(res.participating ?? false);
            setParticipantCount(prev => prev + (res.participating ? 1 : -1));
        }
    };

    const handleArchiveMap = async () => {
        if (!selectedSpot) return;
        if (!confirm("Voulez-vous marquer ce signalement comme terminé ? Il sera déplacé dans les archives.")) return;
        
        const res = await archiveSpot(selectedSpot.id);
        if (res.success) {
            showNotification("Signalement marqué comme terminé et archivé.", "success");
            setSelectedSpot(null);
            loadSpots();
        } else {
            showNotification("Erreur lors de l'archivage : " + res.error, "error");
        }
    };

    const handleFavoriteMap = async () => {
        if (!selectedSpot || !userFullIdentity) {
            return showNotification("Connectez-vous pour ajouter aux favoris", "error");
        }

        const res = await toggleFavorite(selectedSpot.id, userFullIdentity);
        if (res.success) {
            setIsFavorited(res.favorited ?? false);
            showNotification(res.favorited ? "Ajouté aux favoris" : "Retiré des favoris", "success");
        } else {
            showNotification("Erreur favoris : " + res.error, "error");
        }
    };

    const handleAddCommentMap = async () => {
        if (!selectedSpot || !commentInput.trim() || !userFullIdentity) return;

        // On envoie un objet : l'ordre des lignes n'a plus d'importance !
        const res = await addComment({
            spotId: selectedSpot.id,
            author: userFullIdentity,
            content: commentInput
        });

        if (res.success) {
            setCommentInput('');
            const cRes = await getComments(selectedSpot.id);
            if (cRes.success) setSpotComments(cRes.data);
        }
    };
    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (pickingMode) setPickedPosition({ lat, lng });
    }, [pickingMode]);

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
            <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <MapComponent
                        onSelectSpot={handleSelectSpot}
                        selectedSpot={selectedSpot}
                        dbSpots={dbSpots}
                        pickingMode={pickingMode}
                        onMapClick={handleMapClick}
                        pickedPosition={pickedPosition}
                    />
                </div>

                {/* Barre de Recherche */}
                <div className="absolute top-6 left-8 z-50 w-[400px]">
                    <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-xl border border-slate-200/50 flex items-center px-6 h-16">
                        <span className="material-icons-outlined text-slate-400 mr-3">search</span>
                        <input
                            type="text"
                            placeholder="Rechercher un lieu..."
                            className="bg-transparent border-none outline-none text-slate-600 flex-grow text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {filteredSuggestions.length > 0 && (
                        <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                            {filteredSuggestions.map((spot) => (
                                <button
                                    key={spot.id}
                                    onClick={() => handleSelectSpot(spot)}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none text-left"
                                >
                                    <div className={`w-2 h-2 rounded-full ${spot.type === 'Event' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">{spot.title}</span>
                                        <span className="text-[10px] text-slate-400 truncate">{spot.address}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panneau latéral des détails */}
                {selectedSpot && !showForm && (
                    <div className="absolute inset-y-0 right-0 z-40 flex items-start p-6 pointer-events-none">
                        <aside className="w-[360px] max-h-[calc(100vh-120px)] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-y-auto pointer-events-auto animate-in slide-in-from-right-8 duration-500">
                            <div className="relative h-48 w-full">
                                <img src={selectedSpot.image || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400"} className="w-full h-full object-cover" alt="" />
                                <button onClick={() => setSelectedSpot(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">✕</button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${selectedSpot.type === 'Event' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {selectedSpot.type}
                                    </span>
                                    {isOwner(selectedSpot) && (
                                        <div className="flex gap-2">
                                            <button onClick={handleOpenEdit} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100">✏️</button>
                                            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 bg-rose-50 rounded-full hover:bg-rose-100">🗑️</button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h2 className="text-xl font-bold text-slate-800 leading-tight flex-1">{selectedSpot.title}</h2>
                                    <button
                                        onClick={handleFavoriteMap}
                                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                            isFavorited
                                                ? "bg-yellow-400 text-white shadow-inner"
                                                : "bg-slate-100 text-slate-400 hover:bg-yellow-50 hover:text-yellow-500"
                                        }`}
                                    >
                                        <span className="material-icons-outlined text-xl">
                                            {isFavorited ? "star" : "star_border"}
                                        </span>
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 mb-6">{selectedSpot.address}</p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Participants</p>
                                        <p className="text-xl font-black text-slate-800 leading-none">{participantCount}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 leading-relaxed mb-8">{selectedSpot.description}</p>

                                <div className="space-y-3 mb-8">
                                    <button
                                        onClick={handleParticipateMap}
                                        className={`w-full py-3 rounded-2xl font-bold transition-all ${isParticipating
                                            ? "bg-slate-100 text-slate-400 border border-slate-200"
                                            : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"}`}
                                    >
                                        {isParticipating ? "✓ Vous participez" : (selectedSpot.type === "Signalement" ? "Prêter main forte" : "Rejoindre")}
                                    </button>

                                    {selectedSpot.type === "Signalement" && isParticipating && (
                                        <button
                                            onClick={handleArchiveMap}
                                            className="w-full py-3 rounded-2xl font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Marquer comme terminé
                                        </button>
                                    )}
                                </div>

                                {/* Discussion */}
                                <div className="border-t pt-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Discussion</h4>
                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                        {spotComments.map((c, i) => {
                                            // On sépare l'ID du Nom (split par " - ")
                                            const authorParts = c.author ? c.author.split(" - ") : [];
                                            // On prend la deuxième partie (le nom), sinon on garde tout si le format est bizarre
                                            const displayName = authorParts.length > 1 ? authorParts[1] : c.author;

                                            return (
                                                <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    {/* On affiche uniquement displayName au lieu de c.author */}
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">
                                                        {displayName}
                                                    </p>
                                                    <p className="text-xs text-slate-600">{c.content}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            placeholder={user ? "Message..." : "Connectez-vous"}
                                            disabled={!user}
                                            className="flex-1 bg-slate-50 border-none rounded-full px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                        <button
                                            onClick={handleAddCommentMap}
                                            disabled={!user || !commentInput.trim()}
                                            className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center disabled:bg-slate-300"
                                        >➤</button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Modals */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
                            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Supprimer ce spot ?</h3>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Annuler</button>
                                <button onClick={handleDelete} className="flex-1 py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg">Supprimer</button>
                            </div>
                        </div>
                    </div>
                )}

                {showForm && (
                    <SpotFormModal
                        isOpen={showForm}
                        onClose={() => { setShowForm(false); setPickingMode(false); }}
                        onSubmit={handleFormSubmit}
                        initialData={editData}
                        mode={formMode}
                        pickedPosition={pickedPosition}
                    />
                )}
            </div>
        </div>
    );
}