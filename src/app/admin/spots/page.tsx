"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAllSpotsForAdmin, deleteSpotByAdmin, updateSpotByAdmin } from "@/app/actions/adminSpotActions";
import SpotFormModal from "@/app/components/SpotFormModal";

export default function AdminSpotsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [spots, setSpots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"Event" | "Signalement">("Event");
    
    // Modal Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSpotForEdit, setSelectedSpotForEdit] = useState<any>(null);

    useEffect(() => {
        if (status === "unauthenticated" || (session?.user && session.user.statut_pro !== "Admin")) {
            router.push("/login");
        } else if (status === "authenticated") {
            loadSpots();
        }
    }, [status, session, router]);

    const loadSpots = async () => {
        setLoading(true);
        const res = await getAllSpotsForAdmin();
        if (res.success && res.data) {
            setSpots(res.data);
        } else {
            console.error("Erreur chargement spots:", res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (spotId: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cet élément définitivement ? Cela supprimera toutes les participations et commentaires associés.")) return;
        
        const res = await deleteSpotByAdmin(spotId);
        if (res.success) {
            setSpots(prev => prev.filter(s => s.id !== spotId));
            alert("Élément supprimé avec succès.");
        } else {
            alert("Erreur lors de la suppression.");
        }
    };

    const handleEditClick = (spot: any) => {
        setSelectedSpotForEdit(spot);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (data: any) => {
        if (!selectedSpotForEdit) return;
        const res = await updateSpotByAdmin(selectedSpotForEdit.id, data);
        if (res.success) {
            setIsEditModalOpen(false);
            setSelectedSpotForEdit(null);
            alert("Élément modifié avec succès.");
            await loadSpots();
        } else {
            alert("Erreur lors de la modification.");
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin text-teal-600 font-bold text-2xl">⏳</div>
            </div>
        );
    }

    if (!session || session.user.statut_pro !== "Admin") {
        return null;
    }

    const filteredSpots = spots.filter(s => s.type === activeTab);

    return (
        <div className="min-h-screen bg-[#f4f6f5] py-8">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => router.push('/admin/dashboard')}
                        className="p-2 hover:bg-white rounded-full transition-colors text-zinc-500 hover:text-zinc-800 shadow-sm border border-transparent hover:border-zinc-200"
                    >
                        <span className="material-icons-outlined text-xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1a2f28]">
                            Gestion des Événements & Signalements
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Gérez tous les spots de la plateforme.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setActiveTab("Event")}
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${activeTab === "Event" ? "bg-emerald-600 text-white" : "bg-white text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 border border-zinc-200"}`}
                    >
                        <span className="material-icons-outlined text-lg">event</span>
                        Tous les Événements
                    </button>
                    <button 
                        onClick={() => setActiveTab("Signalement")}
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${activeTab === "Signalement" ? "bg-rose-600 text-white" : "bg-white text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200"}`}
                    >
                        <span className="material-icons-outlined text-lg">report_problem</span>
                        Tous les Signalements
                    </button>
                </div>

                {filteredSpots.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-zinc-300 shadow-sm">
                        <span className="material-icons-outlined text-4xl text-zinc-300 mb-4 block">search_off</span>
                        <h3 className="text-lg font-bold text-zinc-800 mb-2">Aucun {activeTab === "Event" ? "événement" : "signalement"} trouvé</h3>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500 tracking-wider">
                                        <th className="p-4 font-bold w-16">ID</th>
                                        <th className="p-4 font-bold">Titre & Lieu</th>
                                        <th className="p-4 font-bold">Auteur</th>
                                        <th className="p-4 font-bold">Date Création</th>
                                        <th className="p-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSpots.map((spot) => (
                                        <tr key={spot.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                                            <td className="p-4 font-medium text-zinc-900 border-r border-zinc-100 text-sm">#{spot.id}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-zinc-800 mb-0.5 text-sm">{spot.title}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <span className="material-icons-outlined text-[10px]">location_on</span>
                                                    <span className="truncate max-w-[250px]">{spot.address || 'Adresse inconnue'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-teal-700">
                                                {spot.author?.split(" - ")[1] || spot.author || "Inconnu"}
                                            </td>
                                            <td className="p-4 text-sm text-zinc-600">
                                                {new Date(spot.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEditClick(spot)}
                                                        className="text-zinc-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                                                        title="Modifier"
                                                    >
                                                        <span className="material-icons-outlined text-sm">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(spot.id)}
                                                        className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                                                        title="Supprimer"
                                                    >
                                                        <span className="material-icons-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal d'édition réutilisée */}
            {isEditModalOpen && selectedSpotForEdit && (
                <SpotFormModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSubmit={handleEditSubmit} 
                    mode="edit" 
                    initialData={selectedSpotForEdit}
                />
            )}
        </div>
    );
}
