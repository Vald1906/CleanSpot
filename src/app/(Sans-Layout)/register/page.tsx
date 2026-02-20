'use client';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 font-sans relative">
            
            {/* Bouton Retour  */}
            <div className="absolute top-8 left-8">
                <a href="/dashboard" className="group flex items-center gap-2 text-gray-400 hover:text-[#1a2f28] transition-all duration-300">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 group-hover:border-[#1a2f28]/30 group-hover:shadow-md transition-all">
                        <span className="material-icons-outlined text-sm">arrow_back</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Fil d'actualité
                    </span>
                </a>
            </div>

            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#1a2f28] rounded-lg flex items-center justify-center shadow-sm">
                    <span className="material-icons-outlined text-white text-2xl">eco</span>
                </div>
                <h1 className="text-2xl font-bold text-[#1a2f28] tracking-tight">CleanSpot</h1>
            </div>

            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-[#1a2f28] mb-1">Connexion</h2>
                <p className="text-[#1a2f28]/60 text-sm mb-8 font-medium">Bienvenue sur votre espace CleanSpot</p>

                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Email</label>
                        <input type="email" placeholder="exemple@mail.com" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all" />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-[#1a2f28]">Mot de passe</label>
                            <a href="#" className="text-xs font-medium text-[#1a2f28] hover:underline">Mot de passe oublié ?</a>
                        </div>
                        <input type="password" placeholder="••••••••" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all" />
                    </div>

                    <button className="w-full bg-[#1a2f28] text-white font-bold py-3.5 rounded-xl hover:bg-[#254239] transition-all shadow-md active:scale-[0.98]">
                        Se Connecter
                    </button>
                </form>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        <span className="text-sm font-medium text-gray-700">Google</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="GitHub" />
                        <span className="text-sm font-medium text-gray-700">GitHub</span>
                    </button>
                </div>
            </div>
        </div>
    );
}