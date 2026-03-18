"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAllUsersWithStats, toggleUserBanStatus } from "@/app/actions/adminUserActions";

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (status === "loading") return;
        
        if (session?.user?.statut_pro !== "Admin") {
            router.replace("/dashboard");
            return;
        }

        loadUsers();
    }, [session, status]);

    async function loadUsers() {
        setLoading(true);
        const res = await getAllUsersWithStats();
        if (res.success && res.data) {
            setUsers(res.data);
        }
        setLoading(false);
    }

    async function handleToggleBan(userId: number, currentStatus: boolean, userName: string) {
        const action = currentStatus ? "réactiver" : "suspendre";
        if (!confirm(`Toutes les sessions actives de cet utilisateur seront affectées. Voulez-vous vraiment ${action} le compte de ${userName} ?`)) {
            return;
        }

        // Optimistic UI update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));

        const res = await toggleUserBanStatus(userId, currentStatus);
        
        if (!res.success) {
            alert("Une erreur est survenue lors de la modification du statut.");
            // Revert on error
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: currentStatus } : u));
        }
    }

    const filteredUsers = users.filter(u => 
        u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faf9] p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <a href="/admin/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center">
                                <span className="material-icons-outlined">arrow_back</span>
                            </a>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestion des Utilisateurs</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Consultez les statistiques et gérez l'accès des membres.</p>
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative max-w-md w-full">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Rechercher par nom, prénom ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-sm outline-none"
                            />
                        </div>
                        <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                            {filteredUsers.length} utilisateur(s)
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Utilisateur</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Créations</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Participations</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Favoris</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Statut</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                                            <td className="py-4 px-6 border-b border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="min-w-10 min-h-10 w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                        {user.prenom ? user.prenom.charAt(0).toUpperCase() : ''}{user.nom ? user.nom.charAt(0).toUpperCase() : ''}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{user.prenom} {user.nom}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-wider">{user.statutAsso}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center border-b border-slate-50">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm">
                                                    {user.stats.creations}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                                                    {user.stats.participations}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 font-bold text-sm">
                                                    {user.stats.favorites}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {user.isBanned ? (
                                                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit mx-auto">
                                                        <span className="material-icons-outlined text-xs">block</span>
                                                        Suspendu
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1 w-fit mx-auto">
                                                        <span className="material-icons-outlined text-xs">check_circle</span>
                                                        Actif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleToggleBan(user.id, user.isBanned, `${user.prenom} ${user.nom}`)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 justify-end ml-auto ${
                                                        user.isBanned 
                                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                                >
                                                    <span className="material-icons-outlined text-sm">
                                                        {user.isBanned ? 'restore' : 'gavel'}
                                                    </span>
                                                    {user.isBanned ? 'Réactiver' : 'Suspendre'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
