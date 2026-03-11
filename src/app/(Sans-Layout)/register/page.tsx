'use client';

// 1. Ajout des imports techniques
import { useActionState } from "react";
import { handleRegister } from "@/app/actions/register";

export default function RegisterPage() {
    // 2. Initialisation du state de l'action
    const [state, formAction, isPending] = useActionState(handleRegister, null);

    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 font-sans relative">
            
            {/* Bouton Retour */}
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

            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-[#1a2f28] mb-1">Créer un compte</h2>
                <p className="text-[#1a2f28]/60 text-sm mb-6 font-medium">Rejoignez la communauté CleanSpot</p>

                {/* 3. Affichage du message d'erreur si l'action échoue */}
                {state?.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                        {state.error}
                    </div>
                )}

                {/* 4. Liaison du formulaire à l'action */}
                <form action={formAction} className="space-y-4">
                    
                    {/* Statut Professionnel (Sélecteur) */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Vous êtes ?</label>
                        <select 
                            name="statut_pro"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all bg-white cursor-pointer text-gray-700"
                        >
                            <option value="Particulier">Un Particulier</option>
                            <option value="Association">Une Association</option>
                        </select>
                    </div>

                    {/* Prénom et Nom */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Prénom</label>
                            <input 
                                type="text" 
                                name="prenom"
                                required
                                placeholder="" 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Nom</label>
                            <input 
                                type="text" 
                                name="nom"
                                required
                                placeholder="" 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all" 
                            />
                        </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Téléphone</label>
                        <input 
                            type="tel" 
                            name="phone"
                            placeholder="" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all" 
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="exemple@mail.com" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all" 
                        />
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Mot de passe</label>
                        <input 
                            type="password" 
                            name="password"
                            required
                            placeholder="••••••••" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all" 
                        />
                    </div>

                    {/* 5. Désactivation du bouton pendant le chargement */}
                    <button 
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#1a2f28] text-white font-bold py-3.5 rounded-xl hover:bg-[#254239] transition-all shadow-md active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Inscription..." : "S'inscrire"}
                    </button>
                </form>

                {/* Divider & Social Buttons */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Ou s'inscrire avec</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        <span className="text-sm font-medium text-gray-700">Google</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="GitHub" />
                        <span className="text-sm font-medium text-gray-700">GitHub</span>
                    </button>
                </div>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Déjà un compte ?{' '}
                    <a href="/login" className="text-[#1a2f28] font-bold hover:underline">Se connecter</a>
                </p>
            </div>

            <footer className="mt-12 text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center">
                © 2024 CLEANSPOT DASHBOARD. TOUS DROITS RÉSERVÉS.
            </footer>
            
        </div>
    );
}