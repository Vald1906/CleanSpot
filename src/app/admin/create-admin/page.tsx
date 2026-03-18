"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { verifyAdminPassword, createAdminAccount } from "@/app/actions/adminCreationActions";

export default function CreateAdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    
    // Nouveaux champs admin
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Modal de sécurité
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [securityLoading, setSecurityLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (status === "unauthenticated" || (session?.user && session.user.statut_pro !== "Admin")) {
            router.push("/login");
        }
    }, [status, session, router]);

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        
        if (!prenom || !nom || !email || !password) {
            setErrorMsg("Tous les champs sont obligatoires pour le nouvel administrateur.");
            return;
        }

        if (password.length < 8) {
            setErrorMsg("Le mot de passe du nouvel admin doit faire au moins 8 caractères.");
            return;
        }

        // On ouvre la modal
        setShowSecurityModal(true);
    };

    const handleSecurityConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        
        if (!adminPassword) {
            setErrorMsg("Veuillez saisir votre mot de passe administrateur actuel.");
            return;
        }

        setSecurityLoading(true);
        // 1. Vérif du MDP Admin actuel
        const verifyRes = await verifyAdminPassword(adminPassword);
        
        if (!verifyRes.success) {
            setErrorMsg(verifyRes.error || "Mot de passe incorrect.");
            setSecurityLoading(false);
            return;
        }

        // 2. Si c'est bon, on crée le compte
        const createRes = await createAdminAccount({ prenom, nom, email, password });
        
        setSecurityLoading(false);

        if (createRes.success) {
            alert("✅ Nouvel administrateur créé avec succès !");
            router.push("/admin/dashboard");
        } else {
            setErrorMsg(createRes.error || "Erreur lors de la création.");
            setShowSecurityModal(false);
            setAdminPassword("");
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin text-teal-600 font-bold text-2xl">⏳</div>
            </div>
        );
    }

    if (!session || session.user.statut_pro !== "Admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f4f6f5] py-8 relative">
            <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => router.push('/admin/dashboard')}
                        className="p-2 hover:bg-white rounded-full transition-colors text-zinc-500 hover:text-zinc-800 shadow-sm border border-transparent hover:border-zinc-200"
                    >
                        <span className="material-icons-outlined text-xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1a2f28] flex items-center gap-2">
                            <span className="material-icons-outlined text-teal-600">admin_panel_settings</span>
                            Créer un Administrateur
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Créez un nouveau compte avec les pleins droits.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                    
                    {errorMsg && !showSecurityModal && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-bold flex items-center gap-2">
                            <span className="material-icons-outlined">error_outline</span>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleInitialSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">Prénom</label>
                                <input 
                                    type="text" 
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    placeholder="Jean"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">Nom</label>
                                <input 
                                    type="text" 
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    placeholder="Dupont"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Adresse Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                placeholder="jean.admin@cleanspot.fr"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Mot de passe provisoire</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-mono"
                                placeholder="••••••••"
                                required
                            />
                            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                                <span className="material-icons-outlined text-[14px]">info</span>
                                L'administrateur pourra changer ce mot de passe plus tard.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm py-4 rounded-xl transition-all flex justify-center items-center gap-2 group"
                        >
                            <span className="material-icons-outlined group-hover:scale-110 transition-transform">how_to_reg</span>
                            Créer ce compte administrateur
                        </button>
                    </form>
                </div>
            </main>

            {/* Modal de sécurité sur-couche */}
            {showSecurityModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => !securityLoading && setShowSecurityModal(false)}></div>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
                        
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 child-bounce">
                            <span className="material-icons-outlined text-3xl">admin_panel_settings</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-center text-zinc-800 mb-2">Vérification de Sécurité</h3>
                        <p className="text-sm text-center text-zinc-500 mb-6">
                            Pour autoriser la création de ce nouveau compte administrateur, veuillez confirmer votre propre identité.
                        </p>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold text-center">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSecurityConfirm}>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-700 mb-1">VOTRE mot de passe admin :</label>
                                <input 
                                    type="password" 
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center font-mono letter-spacing-2"
                                    placeholder="••••••••"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowSecurityModal(false);
                                        setAdminPassword("");
                                        setErrorMsg("");
                                    }}
                                    disabled={securityLoading}
                                    className="flex-1 px-4 py-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    disabled={securityLoading}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-600/20"
                                >
                                    {securityLoading ? <span className="animate-spin material-icons-outlined">loop</span> : "Confirmer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
