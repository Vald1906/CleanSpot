'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminDashboard() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (session?.user?.statut_pro !== "Admin") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#f8faf9] p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panneau d'Administration</h1>
                    <p className="text-slate-500 font-medium">Gestion globale de la plateforme CleanSpot.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Carte Gestion Associations */}
                    <a href="/admin/associations" className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <span className="material-icons-outlined text-3xl">verified_user</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Vérification Associations</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Validez ou refusez les demandes d'inscription des associations pour leur donner accès aux fonctionnalités avancées.
                        </p>
                        <div className="flex items-center text-indigo-600 font-bold text-sm">
                            Gérer les demandes
                            <span className="material-icons-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>

                    {/* Carte Gestion Utilisateurs */}
                    <a href="/admin/users" className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <span className="material-icons-outlined text-3xl">groups</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Gestion des Utilisateurs</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Consultez les statistiques d'activité (participations, créations, favoris) et gérez l'accès des membres de la plateforme.
                        </p>
                        <div className="flex items-center text-emerald-600 font-bold text-sm">
                            Gérer les membres
                            <span className="material-icons-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>

                    {/* Carte Modération Commentaires */}
                    <a href="/admin/comments" className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <span className="material-icons-outlined text-3xl">forum</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Modération des Commentaires</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Consultez, supprimez ou ignorez les commentaires de la plateforme ayant été signalés par la communauté.
                        </p>
                        <div className="flex items-center text-rose-600 font-bold text-sm">
                            Gérer les commentaires
                            <span className="material-icons-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>
                    {/* Carte Gestion Événements & Signalements */}
                    <a href="/admin/spots" className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <span className="material-icons-outlined text-3xl">map</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Gestion Événements & Signalements</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Consultez, modifiez ou supprimez tous les événements et signalements créés sur la plateforme.
                        </p>
                        <div className="flex items-center text-amber-600 font-bold text-sm">
                            Gérer les spots
                            <span className="material-icons-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>

                    {/* Carte Création Administrateur */}
                    <a href="/admin/create-admin" className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <span className="material-icons-outlined text-3xl">admin_panel_settings</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Créer un Administrateur</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Ajoutez un nouveau compte administrateur à la plateforme, sécurisé par votre mot de passe.
                        </p>
                        <div className="flex items-center text-blue-600 font-bold text-sm">
                            Ajouter un compte
                            <span className="material-icons-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>

                    {/* Carte Messages de Contact */}
                    <a href="/admin/contacts" className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                            <span className="material-icons-outlined text-3xl">mail</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Messages de Contact</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Consultez, lisez et gérez les messages envoyés depuis la page de contact publique.
                        </p>
                        <div className="flex items-center text-fuchsia-600 font-bold text-sm">
                            Gérer les messages
                            <span className="material-icons-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
