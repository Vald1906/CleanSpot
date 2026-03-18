"use client";

import React, { useEffect, useState } from "react";
import { getUserProfileData, toggleParticipation, getComments, addComment } from "@/app/actions/spotActions";
import { updateUserInfo, sendPasswordResetEmail, verifyEmailAndChangePassword, deleteAccount } from "@/app/actions/profileActions";
import { getUserByName } from "@/app/actions/userActions";
import { useSession, signOut } from "next-auth/react";

export default function ProfilPage() {
    const [userDetails, setUserDetails] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'created' | 'participated' | 'favorites'>('created');

    // États pour les commentaires
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [selectedSpotForComments, setSelectedSpotForComments] = useState<any>(null);
    const [spotComments, setSpotComments] = useState<any[]>([]);
    const [commentInput, setCommentInput] = useState('');

    // États pour le modal d'informations
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedSpotInfo, setSelectedSpotInfo] = useState<any>(null);

    const [commentsFromInfo, setCommentsFromInfo] = useState(false);

    // États pour l'édition du profil
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ prenom: '', nom: '', email: '' });
    const [resetStep, setResetStep] = useState<'none' | 'code' | 'password'>('none');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    // États pour la suppression de compte
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { data: session, status } = useSession();

    useEffect(() => {
        const loadInitialData = async () => {
            if (status === "loading") return;

            setLoading(true);
            try {
                if (!session?.user?.email) {
                    setLoading(false);
                    return;
                }

                const email = session.user.email;
                const name = session.user.name || "Anonyme";
                const userId = (session.user as any).id || "N/A";
                const fullIdentity = `${userId} - ${name}`;

                const [profileResult, userResult] = await Promise.all([
                    getUserProfileData(name, fullIdentity),
                    getUserByName(email)
                ]);

                if (profileResult.success) setUserData(profileResult.data);
                if (userResult.success) setUserDetails(userResult.user);

            } catch (error) {
                console.error("Erreur technique :", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [session, status]);

    const handleUnsubscribe = async (e: React.MouseEvent, spotId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session?.user?.email) return;

        const name = session.user.name || "Anonyme";
        const userId = (session.user as any).id || "N/A";
        const fullIdentity = `${userId} - ${name}`;

        try {
            const res = await toggleParticipation(spotId, fullIdentity);
            if (res.success) {
                // Rafraîchir les données
                const profileResult = await getUserProfileData(name, fullIdentity);
                if (profileResult.success) setUserData(profileResult.data);
            }
        } catch (error) {
            console.error("Erreur desinscription", error);
        }
    };

    const handleOpenInfo = (spot: any) => {
        setSelectedSpotInfo(spot);
        setIsInfoModalOpen(true);
    };

    const handleOpenComments = async (e: React.MouseEvent, spot: any, fromInfo: boolean = false) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSpotForComments(spot);
        setCommentsFromInfo(fromInfo);
        setIsCommentModalOpen(true);
        setSpotComments([]); // Reset while loading

        const res = await getComments(spot.id);
        if (res.success) {
            setSpotComments(res.data);
        }
    };

    const handleAddCommentProfile = async () => {
        if (!selectedSpotForComments || !commentInput.trim() || !session?.user?.email) return;

        const name = session.user.name || "Anonyme";
        const userId = (session.user as any).id || "N/A";
        const fullIdentity = `${userId} - ${name}`;

        const res = await addComment({
            spotId: selectedSpotForComments.id,
            author: fullIdentity,
            content: commentInput
        });

        if (res.success) {
            setCommentInput('');
            // Recharger les commentaires
            const cRes = await getComments(selectedSpotForComments.id);
            if (cRes.success) setSpotComments(cRes.data);
        } else {
            console.error("Erreur d'ajout de commentaire:", res.error);
        }
    };

    const handleUpdateProfile = async () => {
        if (!userDetails?.id) return;
        setEditError('');
        setEditSuccess('');

        const res = await updateUserInfo(userDetails.id, editForm);
        if (res.success) {
            setEditSuccess("Profil mis à jour !");
            // Rafraîchir localement
            setUserDetails({ ...userDetails, ...editForm });
            setTimeout(() => {
                setIsEditModalOpen(false);
                setEditSuccess('');
            }, 1500);
        } else {
            setEditError(res.error || "Erreur de mise à jour.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!userDetails?.id || !deletePassword) return;
        setDeleteError('');
        setDeleteLoading(true);

        try {
            const res = await deleteAccount(userDetails.id, deletePassword);
            if (res.success) {
                await signOut({ callbackUrl: '/' });
            } else {
                setDeleteError(res.error || "Une erreur est survenue.");
                setDeleteLoading(false);
            }
        } catch (error) {
            setDeleteError("Erreur technique lors de la suppression.");
            setDeleteLoading(false);
        }
    };

    const handleRequestReset = async () => {
        if (!userDetails?.id || !userDetails?.email) return;
        setEditError('');
        setEditSuccess('');

        const res = await sendPasswordResetEmail(userDetails.id, userDetails.email);
        if (res.success) {
            setResetStep('code');
            setEditSuccess("Code envoyé par email (simulé).");
        } else {
            setEditError(res.error || "Échec de l'envoi.");
        }
    };

    const handleVerifyCode = () => {
        if (resetCode === "123456") {
            setResetStep('password');
            setEditError('');
        } else {
            setEditError("Code invalide.");
        }
    };

    const handleChangePassword = async () => {
        if (!userDetails?.id || !newPassword) return;
        if (newPassword !== confirmPassword) {
            setEditError("Les mots de passe ne correspondent pas.");
            return;
        }
        const res = await verifyEmailAndChangePassword(userDetails.id, "123456", newPassword);
        if (res.success) {
            setEditSuccess("Mot de passe modifié avec succès !");
            setTimeout(() => {
                setIsEditModalOpen(false);
                setResetStep('none');
                setNewPassword('');
                setConfirmPassword('');
                setResetCode('');
                setEditSuccess('');
            }, 2000);
        } else {
            setEditError(res.error || "Erreur.");
        }
    };

    const renderSpots = (spots: any[]) => {
        if (!spots || spots.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-emerald-100/50 shadow-sm">
                    <span className="material-icons-outlined text-4xl text-emerald-200 mb-3">folder_open</span>
                    <h3 className="text-lg font-bold text-emerald-900 mb-1">Aucun spot trouvé</h3>
                    <p className="text-sm text-emerald-900/60">Vous n'avez pas encore d'éléments dans cette catégorie.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots.map((spot, index) => {
                    // Formatage de la date et l'heure
                    const dateObj = spot.date
                        ? (typeof spot.date === 'string' ? new Date(spot.date.replace(' ', 'T')) : new Date(spot.date))
                        : new Date(spot.created_at || Date.now());
                    const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                    const timeString = spot.hours || (dateObj.getHours() + ':' + String(dateObj.getMinutes()).padStart(2, '0'));

                    return (
                        <div key={index} className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4">
                                <img src={spot.image || "https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=400"} alt={spot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase text-white shadow-sm backdrop-blur-md border border-white/20 ${spot.type === 'Event' ? 'bg-emerald-500/90' : 'bg-rose-500/90'}`}>
                                        {spot.type}
                                    </span>
                                    {spot.status && (
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase text-white shadow-sm backdrop-blur-md border border-white/20 ${spot.status === 'en cours' ? 'bg-amber-500/90' : 'bg-emerald-500/90'}`}>
                                            {spot.status}
                                        </span>
                                    )}
                                    {activeTab === 'participated' && (
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase text-white shadow-sm backdrop-blur-md border border-white/20 ${
                                            spot.presence === 1 ? 'bg-green-600/90' : 
                                            spot.presence === 0 ? 'bg-rose-600/90' : 
                                            'bg-slate-400/90'
                                        }`}>
                                            {spot.presence === 1 ? 'Présent' : spot.presence === 0 ? 'Absent' : 'En attente'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                                    <button onClick={() => handleOpenInfo(spot)} className="after:absolute after:inset-0 z-0 text-left w-full hover:underline">
                                        {spot.title}
                                    </button>
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{spot.description}</p>

                                <div className="mt-auto border-t border-slate-50 pt-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                            <span className="material-icons-outlined text-[14px]">calendar_today</span>
                                            <span className="truncate">{formattedDate} à {timeString}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="material-icons-outlined text-[14px]">place</span>
                                            <span className="truncate max-w-[100px]" title={spot.address}>{spot.address || 'Non spécifié'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 relative z-10">
                                        <button
                                            onClick={(e) => handleOpenComments(e, spot, false)}
                                            className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl text-xs font-bold text-center hover:bg-emerald-100 transition-colors border border-emerald-100/50"
                                        >
                                            Commenter
                                        </button>
                                        {activeTab === 'participated' && spot.status !== 'terminé' && (
                                            <button
                                                onClick={(e) => handleUnsubscribe(e, spot.id)}
                                                className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-100/50"
                                            >
                                                Se désinscrire
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    // Loader plein écran pendant l'attente
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    <p className="text-emerald-900 font-medium">Chargement de votre profil...</p>
                </div>
            </div>
        );
    }

    // Si après chargement on n'a rien, alors on affiche l'erreur
    if (!userDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8faf9] p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center max-w-md">
                    <span className="material-icons-outlined text-5xl text-rose-400 mb-4">no_accounts</span>
                    <h2 className="text-2xl font-bold text-emerald-900 mb-2">Session introuvable</h2>
                    <p className="text-emerald-900/60 mb-6">
                        Nous n'avons pas pu récupérer vos informations. Essayez de vous reconnecter.
                    </p>
                    <a href="/login" className="inline-block w-full bg-[#1a2f28] text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors">
                        Aller à la page de connexion
                    </a>
                </div>
            </div>
        );
    }

    // RENDU NORMAL SI TOUT EST OK
    return (
        <main className="min-h-screen bg-[#f8faf9]">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header avec les vraies données de userDetails */}
                <div className="bg-[#1a2f28] rounded-3xl p-8 mb-12 text-white flex flex-col md:flex-row items-center gap-8 shadow-md relative">
                    <div className="absolute top-6 right-6 flex gap-3">
                        <button
                            onClick={() => {
                                setEditForm({ prenom: userDetails.prenom, nom: userDetails.nom, email: userDetails.email });
                                setIsEditModalOpen(true);
                            }}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg border border-white/10 backdrop-blur-sm transition-all flex items-center gap-2 group"
                            title="Modifier le profil"
                        >
                            <span className="material-icons-outlined text-sm text-emerald-400">edit</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Modifier</span>
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="bg-rose-500/20 hover:bg-rose-500/40 p-2 rounded-lg border border-rose-500/30 backdrop-blur-sm transition-all flex items-center gap-2 group shadow-sm"
                            title="Supprimer mon compte"
                        >
                            <span className="material-icons-outlined text-sm text-rose-400">delete_forever</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline text-rose-100">Supprimer</span>
                        </button>
                    </div>
                    <div className="w-24 h-24 bg-emerald-500 rounded-2xl flex items-center justify-center text-4xl font-black text-white">
                        {userDetails.prenom?.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                            <h1 className="text-3xl font-black tracking-tight">
                                {userDetails.prenom} {userDetails.nom}
                            </h1>
                            {userDetails.statut_pro && (
                                <span className="bg-white/10 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-white/10">
                                    {userDetails.statut_pro}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 opacity-80">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-icons-outlined text-lg text-emerald-400">email</span>
                                {userDetails.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-icons-outlined text-lg text-emerald-400">calendar_today</span>
                                Inscrit le {new Date(userDetails.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm text-center">
                                <span className="block text-emerald-400 text-[9px] uppercase font-bold tracking-widest mb-1">Créations</span>
                                <span className="text-xl font-bold">{userData?.created?.length || 0}</span>
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm text-center">
                                <span className="block text-emerald-400 text-[9px] uppercase font-bold tracking-widest mb-1">Participations</span>
                                <span className="text-xl font-bold">{userData?.participated?.length || 0}</span>
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm text-center">
                                <span className="block text-emerald-400 text-[9px] uppercase font-bold tracking-widest mb-1">Favoris</span>
                                <span className="text-xl font-bold">{userData?.favorites?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sélecteur d'onglets */}
                <div className="mb-8 flex gap-2 p-1 bg-emerald-100/50 rounded-2xl w-fit">
                    {(['created', 'participated', 'favorites'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-[#1a2f28] text-white shadow-md' : 'text-emerald-900/60 hover:text-emerald-900'
                                }`}
                        >
                            {tab === 'created' ? 'Mes Créations' : tab === 'participated' ? 'Mes Participations' : 'Mes Favoris'}
                        </button>
                    ))}
                </div>

                {/* Liste des spots (Contenu de l'onglet) */}
                <div className="min-h-[300px]">
                    {renderSpots(userData?.[activeTab])}
                </div>

                {/* Modale des commentaires */}
                {isCommentModalOpen && selectedSpotForComments && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
                        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300">
                            {/* Header modal */}
                            <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    {commentsFromInfo && (
                                        <button
                                            onClick={() => {
                                                setIsCommentModalOpen(false);
                                                setTimeout(() => setIsInfoModalOpen(true), 10);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                            title="Retour aux informations"
                                        >
                                            <span className="material-icons-outlined text-sm">arrow_back</span>
                                        </button>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold leading-tight flex items-center gap-2">
                                            Commentaires
                                        </h2>
                                        <p className="text-emerald-100 text-sm truncate max-w-[250px]">{selectedSpotForComments.title}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCommentModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 shadow-sm transition-colors text-white"
                                    title="Fermer"
                                >
                                    <span className="material-icons-outlined text-sm">close</span>
                                </button>
                            </div>

                            {/* Liste des commentaires */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4 min-h-[50vh]">
                                {spotComments.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10">
                                        <span className="material-icons-outlined text-4xl mb-2 opacity-50">forum</span>
                                        <p>Aucun commentaire pour le moment.<br />Soyez le premier à participer !</p>
                                    </div>
                                ) : (
                                    spotComments.map((comment, index) => (
                                        <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-sm text-emerald-800">
                                                    {comment.author.includes(' - ') ? comment.author.split(' - ')[1] : comment.author}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input commentaire */}
                            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Votre message..."
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCommentProfile()}
                                        className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                    <button
                                        onClick={handleAddCommentProfile}
                                        disabled={!commentInput.trim()}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${commentInput.trim()
                                                ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="material-icons-outlined">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modale d'informations du Spot */}
                {isInfoModalOpen && selectedSpotInfo && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
                        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300">

                            {/* Image Header */}
                            <div className="relative h-48 w-full shrink-0">
                                <img
                                    src={selectedSpotInfo.image || "https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=400"}
                                    className="w-full h-full object-cover"
                                    alt={selectedSpotInfo.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <button
                                    onClick={() => setIsInfoModalOpen(false)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-rose-500 hover:bg-rose-600 shadow-md rounded-full flex items-center justify-center text-white transition-colors"
                                >
                                    <span className="material-icons-outlined text-lg">close</span>
                                </button>
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase mb-2 shadow-sm backdrop-blur-md border border-white/20 ${selectedSpotInfo.type === 'Event' ? 'bg-emerald-500/90' : 'bg-rose-500/90'}`}>
                                        {selectedSpotInfo.type}
                                    </span>
                                    <h2 className="text-2xl font-bold leading-tight drop-shadow-md">{selectedSpotInfo.title}</h2>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <span className="material-icons-outlined">place</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Lieu</p>
                                            <p className="text-sm font-medium text-slate-800">{selectedSpotInfo.address || 'Adresse non spécifiée'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <span className="material-icons-outlined">event</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Date & Heure</p>
                                            <p className="text-sm font-medium text-slate-800">
                                                {(() => {
                                                    const dObj = selectedSpotInfo.date ? (typeof selectedSpotInfo.date === 'string' ? new Date(selectedSpotInfo.date.replace(' ', 'T')) : new Date(selectedSpotInfo.date)) : new Date(selectedSpotInfo.created_at || Date.now());
                                                    const fDate = dObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                                                    const tStr = selectedSpotInfo.hours || (dObj.getHours() + ':' + String(dObj.getMinutes()).padStart(2, '0'));
                                                    return `${fDate} à ${tStr}`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                        {selectedSpotInfo.description || 'Aucune description fournie.'}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                                <button
                                    onClick={() => {
                                        setIsInfoModalOpen(false);
                                        // On utilise un setTimeout léger pour éviter un clic superposé
                                        setTimeout(() => handleOpenComments({ preventDefault: () => { }, stopPropagation: () => { } } as any, selectedSpotInfo, true), 10);
                                    }}
                                    className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <span className="material-icons-outlined text-xl">forum</span>
                                    Ouvrir les commentaires
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modale d'Édition du Profil */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20">
                        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-[#1a2f28] p-6 text-white flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-bold leading-tight">Modifier mon profil</h2>
                                <button
                                    onClick={() => { setIsEditModalOpen(false); setResetStep('none'); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <span className="material-icons-outlined text-sm">close</span>
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                                {editError && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold animate-pulse">{editError}</div>}
                                {editSuccess && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold">{editSuccess}</div>}

                                {resetStep === 'none' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold text-slate-400">Prénom</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    value={editForm.prenom}
                                                    onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold text-slate-400">Nom</label>
                                                <input
                                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    value={editForm.nom}
                                                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleUpdateProfile}
                                            className="w-full bg-[#1a2f28] text-white font-bold py-3 rounded-xl hover:bg-black transition shadow-md"
                                        >
                                            Enregistrer les changements
                                        </button>

                                        <div className="pt-4 border-t border-slate-100 text-center">
                                            <button
                                                onClick={handleRequestReset}
                                                className="text-xs font-bold text-emerald-600 hover:underline"
                                            >
                                                Changer mon mot de passe (via Email)
                                            </button>
                                        </div>
                                    </>
                                ) : resetStep === 'code' ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-500 text-center">Entrez le code de vérification reçu par mail.</p>
                                        <div className="flex justify-center">
                                            <input
                                                className="w-32 bg-slate-50 border-none rounded-xl px-4 py-4 text-center text-2xl font-black tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={resetCode}
                                                onChange={(e) => setResetCode(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleVerifyCode}
                                            className="w-full bg-[#1a2f28] text-white font-bold py-3 rounded-xl hover:bg-black transition"
                                        >
                                            Vérifier le code
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Confirmer le mot de passe</label>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            className="w-full bg-[#1a2f28] text-white font-bold py-3 rounded-xl hover:bg-black transition shadow-md"
                                        >
                                            Changer mon mot de passe
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modale de Suppression de Compte */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-rose-600 p-6 text-white flex justify-between items-center">
                                <h2 className="text-xl font-bold">Supprimer mon compte</h2>
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); setDeleteError(''); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <span className="material-icons-outlined text-sm">close</span>
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-6">
                                    <div className="flex gap-3">
                                        <span className="material-icons-outlined text-rose-500">warning</span>
                                        <p className="text-sm font-medium text-rose-700 leading-relaxed">
                                            Cette action est irreversible. Toutes vos données seront définitivement supprimées.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Confirmez avec votre mot de passe</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-slate-400 text-lg">lock</span>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                                placeholder="Votre mot de passe actuel"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {deleteError && (
                                        <p className="text-xs font-bold text-rose-500 px-1 animate-shake">{deleteError}</p>
                                    )}

                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteLoading || !deletePassword}
                                        className="w-full bg-rose-600 text-white font-bold py-4 rounded-2xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {deleteLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-icons-outlined text-xl">delete_forever</span>
                                                Supprimer définitivement
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); setDeleteError(''); }}
                                        className="w-full text-slate-400 text-sm font-bold py-2 hover:text-slate-600 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}