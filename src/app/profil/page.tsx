"use client";

import React, { useEffect, useState } from "react";
import { getUserProfileData } from "@/app/actions/spotActions";
import { getUserByName } from "@/app/actions/userActions";
import Navbar from "@/app/components/navbar";

export default function ProfilPage() {
    const [userName, setUserName] = useState<string>("");
    const [userDetails, setUserDetails] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'created' | 'participated' | 'favorites'>('created');

    useEffect(() => {
        const savedName = localStorage.getItem("cleanspot_username") || "Utilisateur Anonyme";
        setUserName(savedName);
        loadData(savedName);
    }, []);

    const loadData = async (name: string) => {
        setLoading(true);
        try {
            const [profileResult, userResult] = await Promise.all([
                getUserProfileData(name),
                getUserByName(name)
            ]);

            if (profileResult.success) {
                setUserData(profileResult.data);
            }
            if (userResult.success) {
                setUserDetails(userResult.user);
            }
        } catch (error) {
            console.error("Erreur chargement profil:", error);
        }
        setLoading(false);
    };

    const renderSpots = (spots: any[]) => {
        if (!spots || spots.length === 0) {
            return (
                <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-emerald-200">
                    <span className="material-icons-outlined text-4xl text-emerald-300 mb-2">folder_open</span>
                    <p className="text-emerald-900/60">Aucun élément dans cette catégorie.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots.map((spot) => (
                    <div key={spot.id} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow">
                        {spot.image ? (
                            <img src={spot.image} alt={spot.title} className="w-full h-40 object-cover" />
                        ) : (
                            <div className="w-full h-40 bg-emerald-50 flex items-center justify-center">
                                <span className="material-icons-outlined text-4xl text-emerald-200">image</span>
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${spot.type === 'Event' ? 'bg-emerald-100 text-emerald-700' :
                                    spot.type === 'Signalement' ? 'bg-rose-100 text-rose-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {spot.type}
                                </span>
                            </div>
                            <h3 className="font-bold text-emerald-900 truncate">{spot.title}</h3>
                            <p className="text-sm text-emerald-900/60 line-clamp-2 mt-1">{spot.description}</p>
                            <div className="mt-4 pt-4 border-t border-emerald-50 flex justify-between items-center text-[10px] text-emerald-900/40">
                                <span className="flex items-center gap-1">
                                    <span className="material-icons-outlined text-xs">location_on</span>
                                    {spot.address?.split(',')[0]}
                                </span>
                                <span>{new Date(spot.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-[#f8faf9]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Profil */}
                <div className="bg-[#1a2f28] rounded-3xl p-8 mb-12 text-white flex flex-col md:flex-row items-center gap-8 shadow-md">
                    <div className="w-24 h-24 bg-emerald-500 rounded-2xl flex items-center justify-center text-4xl font-black text-white">
                        {userName.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                            <h1 className="text-3xl font-black tracking-tight">{userName}</h1>
                            {userDetails?.statut_pro && (
                                <span className="bg-white/10 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-white/10 w-fit mx-auto md:mx-0">
                                    {userDetails.statut_pro}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 opacity-80">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-icons-outlined text-lg">email</span>
                                {userDetails?.email || "Email non renseigné"}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-icons-outlined text-lg">calendar_today</span>
                                Inscrit le {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Date inconnue"}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <span className="block text-emerald-400 text-[9px] uppercase font-bold tracking-widest mb-1">Signalements</span>
                                <span className="text-xl font-bold">{userData?.created?.length || 0}</span>
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <span className="block text-emerald-400 text-[9px] uppercase font-bold tracking-widest mb-1">Participations</span>
                                <span className="text-xl font-bold">{userData?.participated?.length || 0}</span>
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <span className="block text-emerald-400 text-[9px] uppercase font-bold tracking-widest mb-1">Favoris</span>
                                <span className="text-xl font-bold">{userData?.favorites?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Onglets d'activité */}
                <div className="mb-8 flex gap-2 p-1 bg-emerald-100/50 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'created' ? 'bg-[#1a2f28] text-white shadow-md' : 'text-emerald-900/60 hover:text-emerald-900'
                            }`}
                    >
                        Mes Créations
                    </button>
                    <button
                        onClick={() => setActiveTab('participated')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'participated' ? 'bg-[#1a2f28] text-white shadow-md' : 'text-emerald-900/60 hover:text-emerald-900'
                            }`}
                    >
                        Mes Participations
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'favorites' ? 'bg-[#1a2f28] text-white shadow-md' : 'text-emerald-900/60 hover:text-emerald-900'
                            }`}
                    >
                        Mes Favoris
                    </button>
                </div>

                {/* Contenu de l'onglet */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl h-64 border border-emerald-100 animate-pulse overflow-hidden">
                                    <div className="h-40 bg-emerald-50/50" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 w-20 bg-emerald-50/50 rounded" />
                                        <div className="h-6 w-40 bg-emerald-50/50 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {activeTab === 'created' && renderSpots(userData?.created || [])}
                            {activeTab === 'participated' && renderSpots(userData?.participated || [])}
                            {activeTab === 'favorites' && renderSpots(userData?.favorites || [])}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
