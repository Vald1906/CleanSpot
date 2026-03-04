'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavBar() {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Vérifie si le lien est la page actuelle
    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { name: "Fil d'actualité", href: "/dashboard" },
        { name: "Carte", href: "/map" },
        { name: "Événements", href: "/event" },
    ];

    return (
        <nav className="bg-[#1a2f28] text-white sticky top-0 z-[60] px-6 h-16 flex items-center shadow-lg">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img
                            src="/images/cleanspot.png"
                            alt="CleanSpot Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <a href="/" className="text-2xl font-black tracking-tighter transition-opacity hover:opacity-80">
                        CleanSpot
                    </a>
                </div>

                {/* Navigation - Barre rose dynamique */}
                <div className="hidden md:flex items-center gap-8 h-16">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-all relative h-full flex items-center ${isActive(link.href) ? 'text-white' : 'text-white/70 hover:text-white'
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

                    {/* Boutons Auth */}
                    <div className="hidden lg:flex items-center gap-4">
                        <a href="/login" className="text-sm font-medium text-white/80 hover:text-white">
                            Se connecter
                        </a>
                        <a href="/register" className="text-sm font-medium bg-white/20 text-white border border-white/30 px-5 py-2 rounded-lg hover:bg-white/30 transition-all shadow-sm backdrop-blur-sm">
                            S'inscrire
                        </a>
                    </div>

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
                            <span className="text-sm font-medium hidden sm:block">Mon Profil</span>
                            <div className="w-9 h-9 rounded-full border-2 border-white/30 group-hover:border-white transition-all p-0.5 overflow-hidden">
                                <img
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDafOqCAo64K6r-DGFSF5rKevBja4iuWkdPxakqon914Qedgi-m9Qade3ouB_y80c4eFMNVno-pBvppDXR0DpU3c9ctekV2V9IkW1fPXHZiQ4nAO_1NB41fLoMoqmgKASiBZBmSK2JnxZSScjHky-XFQfOYNVc-1uxM_NeaDEBdrp4NmkgsE9SfFM4k9OeGhOKAAwdsGKlVsbHH7jgYvTsKkey_T5rZ-Yc_whAuo6E22zVWZmmtFwC44leMK6IGBsJkACwp-LkJ_fI"
                                />
                            </div>
                        </button>

                        {/* Dropdown - Profil & Contact */}
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                                <a href="/profil" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#1a2f28] transition-colors">
                                    <span className="material-icons-outlined text-[18px]">person</span>
                                    Mon Profil
                                </a>
                                <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                                <a href="/contact" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#1a2f28] transition-colors">
                                    <span className="material-icons-outlined text-[18px]">mail</span>
                                    Contact
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}