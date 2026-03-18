"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssociationDashboardData, getSpotParticipants, updateAttendance, checkAssociationProfileComplete } from "@/app/actions/associationActions";
import { archiveSpot } from "@/app/actions/spotActions";
import { useSession, signOut } from "next-auth/react";
import AssociationProfilePopup from "@/app/components/AssociationProfilePopup";

/** Écran d'attente de validation affiché quand is_verified === 0.
 *  Toutes les 10s, il appelle update() pour forcer NextAuth à relire
 *  is_verified depuis la BDD — quand l'admin valide, la page se met à jour
 *  automatiquement sans déconnexion. */
function VerificationWaiting({ update }: { update: () => Promise<any> }) {
    useEffect(() => {
        const interval = setInterval(() => {
            update();
        }, 10000); // poll toutes les 10 secondes
        return () => clearInterval(interval);
    }, [update]);

    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-icons-outlined text-4xl text-amber-500 animate-pulse">pending_actions</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1a2f28] mb-2">Vérification en cours</h1>
            <p className="text-gray-500 max-w-md mx-auto mb-2">
                Votre compte association est actuellement en cours de vérification par un administrateur.
                Vous pourrez accéder à votre espace dès que votre statut sera validé.
            </p>
            <p className="text-xs text-gray-300 mb-8">Cette page se met à jour automatiquement.</p>
            <div className="flex gap-4">
                <a href="/dashboard" className="px-6 py-3 bg-[#1a2f28] text-white rounded-xl font-bold hover:bg-[#254239] transition-all">
                    Retour à l'accueil
                </a>
            </div>
        </div>
    );
}


export default function AssociationDashboard() {

    const [userName, setUserName] = useState<string | null>(null);
    const [data, setData] = useState<{ association: any, active: any[], archived: any[] } | null>(null);
    const [selectedSpot, setSelectedSpot] = useState<any | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingAttendance, setUpdatingAttendance] = useState<number | null>(null);
    const [showProfilePopup, setShowProfilePopup] = useState(false);

    const { data: session, status, update } = useSession();
    const userSession = session?.user;
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (userSession && (userSession as any).statut_pro === "Association") {
            const userId = parseInt(userSession.id);

            // Vérifier si le profil est complet (premier login)
            checkAssociationProfileComplete(userId).then(({ complete }) => {
                if (!complete) {
                    router.replace("/association/setup");
                } else {
                    const fullIdentity = `${userSession.id} - ${userSession.name}`;
                    setUserName(fullIdentity);
                    loadDashboardData(fullIdentity, userId);
                }
            });
        } else {
            setLoading(false);
        }
    }, [session, status]);

    async function loadDashboardData(author: string, userId: number) {
        setLoading(true);
        const res = await getAssociationDashboardData(author, userId);
        if (res.success && res.data) {
            setData(res.data);

            // Vérifier si le profil est incomplet
            const asso = res.data.association;
            if (asso && (!asso.description || !asso.adresse || !asso.ville || !asso.typeAsso)) {
                // On affiche le popup uniquement si c'est la première fois dans cette session
                // ou si l'utilisateur n'a pas explicitement refusé durant cette vue
                setShowProfilePopup(true);
            }
        }
        setLoading(false);
    }

    async function handleSelectSpot(spot: any) {
        setSelectedSpot(spot);
        const res = await getSpotParticipants(spot.id);
        if (res.success && res.data) {
            setParticipants(res.data);
        }
    }

    async function handleAttendance(participationId: number, isPresent: boolean, participantName: string) {
        setUpdatingAttendance(participationId);
        const res = await updateAttendance(participationId, isPresent, selectedSpot.title, participantName);
        if (res.success) {
            // Mettre à jour localement la liste des participants
            setParticipants(prev => prev.map(p =>
                p.id === participationId ? { ...p, presence: isPresent ? 1 : 0 } : p
            ));
        }
        setUpdatingAttendance(null);
    }

    async function handleArchive() {
        if (!selectedSpot) return;
        if (!confirm("Voulez-vous marquer cet événement comme terminé ? Il sera déplacé dans les archives.")) return;

        const res = await archiveSpot(selectedSpot.id);
        if (res.success) {
            setSelectedSpot(null);
            if (userName && userSession) loadDashboardData(userName, parseInt(userSession.id));
        } else {
            alert("Erreur lors de l'archivage : " + res.error);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2f28]"></div>
            </div>
        );
    }

    if (!userName) {
        return (
            <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 text-center">
                <span className="material-icons-outlined text-6xl text-gray-300 mb-4">lock</span>
                <h1 className="text-2xl font-bold text-[#1a2f28] mb-2">Accès Restreint</h1>

                {!userSession ? (
                    <>
                        <p className="text-gray-500 mb-6">Veuillez vous connecter en tant qu'association pour accéder à ce tableau de bord.</p>
                        <a href="/login" className="px-6 py-3 bg-[#1a2f28] text-white rounded-xl font-bold hover:bg-[#254239] transition-all">
                            Se connecter
                        </a>
                    </>
                ) : (
                    <>
                        <p className="text-gray-500 mb-2">Vous êtes connecté en tant que <strong>{userSession.name}</strong>.</p>
                        <p className="text-gray-400 mb-6 text-sm">
                            Votre statut actuel est : <strong>{(userSession as any).statut_pro || "Inconnu"}</strong>.<br />
                            Ce tableau de bord est réservé aux comptes de type <strong>Association</strong>.
                        </p>
                        <div className="flex gap-4">
                            <a href="/dashboard" className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                Retour à l'accueil
                            </a>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all"
                            >
                                Changer de compte
                            </button>
                        </div>
                        <p className="mt-8 text-[10px] text-gray-300 uppercase font-bold tracking-widest">
                            Note : Si vous venez de vous enregistrer, essayez de vous déconnecter et de vous reconnecter.
                        </p>
                    </>
                )}
            </div>
        );
    }

    if ((userSession as any)?.is_verified === 0) {
        return (
            <VerificationWaiting update={update} />
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faf9] p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a2f28] tracking-tight">Tableau de Bord Association</h1>
                        <p className="text-gray-500 font-medium">Gérez vos événements et suivez les participations.</p>
                    </div>
                    <div className="flex gap-4">
                        <a href="/dashboard" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                            <span className="material-icons-outlined text-sm">home</span>
                            Accueil
                        </a>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Liste des Spots */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-[#1a2f28] mb-4 flex items-center gap-2">
                                <span className="material-icons-outlined text-[#1a2f28]">event</span>
                                Vos Événements
                            </h2>

                            {(data?.active?.length ?? 0) === 0 && (data?.archived?.length ?? 0) === 0 ? (
                                <p className="text-sm text-gray-400 italic py-4">Vous n'avez pas encore créé d'événements.</p>
                            ) : (
                                <div className="space-y-3">
                                    {data?.active?.map(spot => (
                                        <button
                                            key={spot.id}
                                            onClick={() => handleSelectSpot(spot)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedSpot?.id === spot.id ? 'border-[#1a2f28] bg-[#1a2f28]/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1a2f28]/50">{new Date(spot.date).toLocaleDateString()}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold uppercase">Actif</span>
                                            </div>
                                            <h3 className="font-bold text-[#1a2f28] line-clamp-1">{spot.title}</h3>
                                        </button>
                                    ))}

                                    {(data?.archived?.length ?? 0) > 0 && (
                                        <>
                                            <div className="pt-4 pb-2 border-t border-gray-50 mt-4">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Archives</span>
                                            </div>
                                            {data?.archived?.map(spot => (
                                                <button
                                                    key={spot.id}
                                                    onClick={() => handleSelectSpot(spot)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedSpot?.id === spot.id ? 'border-gray-400 bg-gray-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{new Date(spot.date).toLocaleDateString()}</span>
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold uppercase">Terminé</span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-500 line-clamp-1">{spot.title}</h3>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Détails et Participants */}
                    <div className="lg:col-span-2 space-y-8">
                        {selectedSpot ? (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8 border-b border-gray-100 pb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 rounded-full bg-[#1a2f28]/10 text-[#1a2f28] text-xs font-bold uppercase tracking-wider">
                                                {selectedSpot.type}
                                            </div>
                                            <span className="text-gray-400 text-sm">•</span>
                                            <div className="text-gray-500 text-sm flex items-center gap-1">
                                                <span className="material-icons-outlined text-sm">calendar_today</span>
                                                {new Date(selectedSpot.date).toLocaleDateString()} à {selectedSpot.hours}
                                            </div>
                                        </div>

                                        {!data?.archived?.some(s => s.id === selectedSpot.id) && (
                                            <button
                                                onClick={handleArchive}
                                                className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-2 border border-rose-100"
                                            >
                                                <span className="material-icons-outlined text-sm">archive</span>
                                                Marquer comme terminé
                                            </button>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1a2f28] mb-4">{selectedSpot.title}</h2>
                                    <p className="text-gray-600 leading-relaxed">{selectedSpot.description}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-[#1a2f28] flex items-center gap-2">
                                            <span className="material-icons-outlined text-[#1a2f28]">people</span>
                                            Participants ({participants.length})
                                        </h3>
                                        <div className="text-xs text-gray-400 font-medium">Cochez leur présence le jour J</div>
                                    </div>

                                    {participants.length === 0 ? (
                                        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                            <span className="material-icons-outlined text-4xl text-gray-200 mb-2">person_off</span>
                                            <p className="text-gray-400 font-medium">Aucun inscrit pour le moment.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {participants.map(p => (
                                                <div key={p.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-[#1a2f28]/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#1a2f28] font-bold">
                                                            {p.userName.split('-').pop()?.trim().charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#1a2f28] text-sm">
                                                                {p.userName.split('-').pop()?.trim()}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                <span className="material-icons-outlined text-[10px]">alternate_email</span>
                                                                {p.userName.includes('@') ? p.userName : 'Utilisateur ID: ' + p.userName.split(' - ')[0]}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            disabled={updatingAttendance === p.id}
                                                            onClick={() => handleAttendance(p.id, true, p.userName)}
                                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${p.presence === 1 ? 'bg-green-500 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                                                            title="Était présent"
                                                        >
                                                            {updatingAttendance === p.id ? (
                                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <span className="material-icons-outlined text-xl">check</span>
                                                            )}
                                                        </button>
                                                        <button
                                                            disabled={updatingAttendance === p.id}
                                                            onClick={() => handleAttendance(p.id, false, p.userName)}
                                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${p.presence === 0 ? 'bg-red-500 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                                                            title="Était absent"
                                                        >
                                                            {updatingAttendance === p.id ? (
                                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <span className="material-icons-outlined text-xl">close</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] bg-white rounded-2xl border border-gray-100 border-dashed flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-icons-outlined text-4xl text-gray-200">dashboard_customize</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#1a2f28] mb-2">Sélectionnez un événement</h3>
                                <p className="text-gray-400 max-w-sm">Choisissez un événement dans la liste de gauche pour gérer les participants et valider les présences.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showProfilePopup && data?.association && (
                <AssociationProfilePopup
                    association={data.association}
                    userId={parseInt(userSession!.id)}
                    onClose={() => setShowProfilePopup(false)}
                    onSuccess={() => {
                        if (userName && userSession) loadDashboardData(userName, parseInt(userSession.id));
                    }}
                />
            )}
        </div>
    );
}
