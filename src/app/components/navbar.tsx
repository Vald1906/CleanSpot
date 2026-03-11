'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { handleLogout } from "@/app/actions/logout";

// Interface pour recevoir l'utilisateur depuis le layout
interface NavBarProps {
    user?: { nom: string; prenom: string; email: string } | null;
}

export default function NavBar({ user }: NavBarProps) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { name: "Fil d'actualité", href: "/dashboard" },
        { name: "Carte", href: "/map" },
        { name: "Événements", href: "/event" },
    ];

    return (
        <nav className="bg-[#1a2f28] text-white sticky top-0 z-[60] px-6 h-16 flex items-center shadow-lg">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                
                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="material-icons-outlined text-white text-xl">eco</span>
                    </div>
                    <a href="/" className="text-xl font-bold tracking-tight">
                        CleanSpot
                    </a>
                </div>

                {/* Navigation */}
                <div className="hidden md:flex items-center gap-8 h-16">
                    {navLinks.map((link) => (
                        <a 
                            key={link.href}
                            href={link.href} 
                            className={`text-sm font-medium transition-all relative h-full flex items-center ${
                                isActive(link.href) ? 'text-white' : 'text-white/70 hover:text-white'
                            }`}
                        >
                            {link.name}
                            {isActive(link.href) && (
                                <span className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full"></span>
                            )}
                        </a>
                    ))}
                </div>

                {/* Actions & Profile */}
                <div className="flex items-center gap-4">
                    
                    {/* CONDITION : On n'affiche les boutons que si l'user n'est PAS connecté */}
                    {!user && (
                        <div className="hidden lg:flex items-center gap-4">
                            <a href="/login" className="text-sm font-medium text-white/80 hover:text-white">
                                Se connecter
                            </a>
                            <a href="/register" className="text-sm font-medium bg-white/20 text-white border border-white/30 px-5 py-2 rounded-lg hover:bg-white/30 transition-all shadow-sm backdrop-blur-sm">
                                S'inscrire
                            </a>
                        </div>
                    )}

                    <div className="h-8 w-[1px] bg-white/20 mx-1 hidden lg:block"></div>

                    {/* Notifications */}
                    <button className="p-2 text-white/80 hover:text-white transition-colors">
                        <span className="material-icons-outlined">notifications</span>
                    </button>
                    
                    <div className="h-8 w-[1px] bg-white/20 mx-1"></div>
                    
                    {/* Menu Profil */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-3 pl-2 group"
                        >
                            {/* CONDITION : Affiche le nom de l'user ou "Mon Profil" */}
                            <span className="text-sm font-medium hidden sm:block">
                                {user ? `${user.prenom} ${user.nom}` : "Mon Profil"}
                            </span>
                            <div className="w-9 h-9 rounded-full border-2 border-white/30 group-hover:border-white transition-all p-0.5 overflow-hidden">
                                <img
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                    src={user ? `https://ui-avatars.com/api/?name=${user.prenom}+${user.nom}&background=random` : "https://lh3.googleusercontent.com/aida-public/AB6AXuDafOqCAo64K6r-DGFSF5rKevBja4iuWkdPxakqon914Qedgi-m9Qade3ouB_y80c4eFMNVno-pBvppDXR0DpU3c9ctekV2V9IkW1fPXHZiQ4nAO_1NB41fLoMoqmgKASiBZBmSK2JnxZSScjHky-XFQfOYNVc-1uxM_NeaDEBdrp4NmkgsE9SfFM4k9OeGhOKAAwdsGKlVsbHH7jgYvTsKkey_T5rZ-Yc_whAuo6E22zVWZmmtFwC44leMK6IGBsJkACwp-LkJ_fI"}
                                />
                            </div>
                        </button>

                        {/* Dropdown */}
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-4 w-44 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                                <a href="/contact" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1a2f28] transition-colors">
                                    <span className="material-icons-outlined text-[18px]">mail</span>
                                    Contact
                                </a>

                                {/* CONDITION : On ajoute le bouton déconnexion si connecté */}
                                {user && (
                                    <>
                                        <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                                        <button 
                                            onClick={() => handleLogout()}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <span className="material-icons-outlined text-[18px]">logout</span>
                                            Se déconnecter
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}