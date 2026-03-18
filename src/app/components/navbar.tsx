'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react"; // Import NextAuth
import NotificationCenter from "./NotificationCenter";

export default function NavBar() {
    const { data: session, status } = useSession(); // Récupère la session et son statut
    const user = session?.user; // L'utilisateur connecté

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const pathname = usePathname();

    // --- LOGIQUE DE MASQUAGE ---
    const noNavbarRoutes = ["/", "/login", "/register"];
    if (noNavbarRoutes.includes(pathname)) return null;

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { name: "Fil d'actualité", href: "/dashboard" },
        { name: "Carte", href: "/map" },
        { name: "Événements", href: "/event" },
        { name: "Contact", href: "/contact" },
    ];

    // Ajouter le lien admin si c'est un admin
    if (user?.statut_pro === "Admin") {
        navLinks.push({ name: "Administration", href: "/admin/dashboard" });
    }

    // Ajouter le lien association si c'est une association
    // @ts-ignore - statut_pro est ajouté dynamiquement à la session
    if (user?.statut_pro === "Association") {
        const isVerified = (user as any)?.is_verified === 1;
        navLinks.push({ 
            name: isVerified ? "Espace Asso" : "Espace Asso (Vérification...)", 
            href: "/association/dashboard" 
        });
    }

    return (
        <nav className="bg-[#1a2f28] text-white sticky top-0 z-[60] px-6 h-16 flex items-center shadow-lg">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img src="/images/cleanspot.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <a href="/" className="text-2xl font-black tracking-tighter">CleanSpot</a>
                </div>

                {/* Liens de navigation */}
                <div className="hidden md:flex items-center gap-8 h-16">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className={`text-sm font-medium transition-all relative h-full flex items-center ${isActive(link.href) ? 'text-white' : 'text-white/70 hover:text-white'}`}>
                            {link.name}
                            {isActive(link.href) && <span className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400 rounded-t-full"></span>}
                        </a>
                    ))}
                </div>

                {/* Droite : Auth ou Profil */}
                <div className="flex items-center gap-4">
                    {status === "loading" ? (
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="w-20 h-5 bg-white/10 rounded-md animate-pulse"></div>
                            <div className="w-24 h-9 bg-white/10 rounded-lg animate-pulse"></div>
                        </div>
                    ) : !user ? (
                        <div className="hidden lg:flex items-center gap-4">
                            <a href="/login" className="text-sm font-medium text-white/80 hover:text-white">Se connecter</a>
                            <a href="/register" className="text-sm font-medium bg-white/20 px-5 py-2 rounded-lg hover:bg-white/30 transition-all">S'inscrire</a>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <NotificationCenter />

                            <div className="h-8 w-[1px] bg-white/20 mx-1"></div>

                            <div className="relative">
                                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 pl-2 group">
                                    <span className="text-sm font-medium hidden sm:block">
                                        {user.name} {/* NextAuth utilise .name par défaut */}
                                    </span>
                                    <div className="w-9 h-9 rounded-full border-2 border-emerald-400 p-0.5 overflow-hidden">
                                        <img alt="Profile" className="w-full h-full object-cover rounded-full" src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} />
                                    </div>
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                                        <a href="/profil" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#1a2f28]">
                                            <span className="material-icons-outlined text-[18px]">person</span> Mon Profil
                                        </a>
                                        <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })} // Utilisation de signOut de NextAuth
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <span className="material-icons-outlined text-[18px]">logout</span> Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}