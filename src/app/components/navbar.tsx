'use client';

export default function NavBar() {

    return (
        <nav className="bg-[#1a2f28] text-white sticky top-0 z-[60] px-6 h-16 flex items-center shadow-lg">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="material-icons-outlined text-white text-xl">eco</span>
                    </div>
                    <a href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
                        CleanSpot
                    </a>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a className="text-white/80 hover:text-white transition-colors text-sm font-medium" href="/dashboard">Fil d'actualité</a>
                    <a className="text-white/80 hover:text-white transition-colors text-sm font-medium" href="/map">Carte</a>
                    <a className="text-white font-semibold text-sm relative" href="/event">
                        Événements
                        <span className="absolute -bottom-5 left-0 right-0 h-1 bg-secondary rounded-t-full"></span>
                    </a>
                </div>

                {/* User Actions & Profile */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-white/80 hover:text-white transition-colors">
                        <span className="material-icons-outlined">notifications</span>
                    </button>
                    <div className="h-8 w-[1px] bg-white/20 mx-1"></div>
                    <button className="flex items-center gap-3 pl-2 group">
                        <span className="text-sm font-medium hidden sm:block">Mon Profil</span>
                        <div className="w-9 h-9 rounded-full border-2 border-white/30 group-hover:border-white transition-all p-0.5 overflow-hidden">
                            <img
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDafOqCAo64K6r-DGFSF5rKevBja4iuWkdPxakqon914Qedgi-m9Qade3ouB_y80c4eFMNVno-pBvppDXR0DpU3c9ctekV2V9IkW1fPXHZiQ4nAO_1NB41fLoMoqmgKASiBZBmSK2JnxZSScjHky-XFQfOYNVc-1uxM_NeaDEBdrp4NmkgsE9SfFM4k9OeGhOKAAwdsGKlVsbHH7jgYvTsKkey_T5rZ-Yc_whAuo6E22zVWZmmtFwC44leMK6IGBsJkACwp-LkJ_fI"
                            />
                        </div>
                    </button>
                </div>
            </div>
        </nav>
    );
}



