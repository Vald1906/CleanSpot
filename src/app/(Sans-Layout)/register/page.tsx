'use client';

import { useActionState, useState, useEffect } from "react";
import { handleRegister } from "@/app/actions/register";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(handleRegister, null);
    const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);
    const [userType, setUserType] = useState<"Particulier" | "Association">("Particulier");
    const [step, setStep] = useState(1);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        
        // Log for debugging (optional, can be removed later)
        console.log("Form values:", Object.fromEntries(formData.entries()));

        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            e.preventDefault();
            setPasswordMatchError("Les mots de passe ne correspondent pas.");
            return;
        }

        setPasswordMatchError(null);
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    // Reset step when user type changes
    useEffect(() => {
        setStep(1);
    }, [userType]);

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

                {(state?.error || passwordMatchError) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl transition-all duration-300">
                        {passwordMatchError || state?.error}
                    </div>
                )}

                <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* PERSISTENT FIELD: Statut Pro */}
                    <input type="hidden" name="statut_pro" value={userType} />

                    {/* Étape Commune : Choix du type (uniquement visible à l'étape 1) */}
                    <div className={step === 1 ? "block" : "hidden"}>
                        <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Vous êtes ?</label>
                        <select 
                            value={userType}
                            onChange={(e) => setUserType(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all bg-white cursor-pointer text-gray-700"
                        >
                            <option value="Particulier">Un Particulier</option>
                            <option value="Association">Une Association</option>
                        </select>
                    </div>

                    {/* FORMULAIRE PARTICULIER */}
                    <div className={userType === "Particulier" ? "block space-y-4" : "hidden"}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Prénom</label>
                                <input type="text" name="prenom" required={userType === "Particulier"} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Nom</label>
                                <input type="text" name="nom" required={userType === "Particulier"} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Email</label>
                            <input type="email" name="email_particulier" required={userType === "Particulier"} placeholder="exemple@mail.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Mot de passe</label>
                                <input type="password" name="password_particulier" required={userType === "Particulier"} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Confirmation</label>
                                <input type="password" name="confirmPassword_particulier" required={userType === "Particulier"} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                        </div>
                        <button type="submit" disabled={isPending} className="w-full bg-[#1a2f28] text-white font-bold py-3.5 rounded-xl hover:bg-[#254239] transition-all disabled:opacity-50">
                            {isPending ? "Inscription..." : "S'inscrire"}
                        </button>
                    </div>

                    {/* FORMULAIRE ASSOCIATION (MULTI-STEP) */}
                    <div className={userType === "Association" ? "block space-y-4" : "hidden"}>
                        {/* Indicateur d'étape */}
                        <div className="flex justify-between mb-6">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#1a2f28] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {s}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${step >= s ? 'text-[#1a2f28]' : 'text-gray-300'}`}>
                                        {s === 1 ? 'Identifiants' : s === 2 ? 'Identité' : 'Contact'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Étape 1 : Identifiants */}
                        <div className={step === 1 ? "block space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Email de l'association</label>
                                <input type="email" name="email_asso" required={userType === "Association" && step === 1} placeholder="contact@asso.fr" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Mot de passe</label>
                                <input type="password" name="password_asso" required={userType === "Association" && step === 1} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Confirmer le mot de passe</label>
                                <input type="password" name="confirmPassword_asso" required={userType === "Association" && step === 1} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <button type="button" onClick={nextStep} className="w-full bg-[#1a2f28] text-white font-bold py-3.5 rounded-xl hover:bg-[#254239] transition-all">
                                Suivant
                            </button>
                        </div>

                        {/* Étape 2 : Identité */}
                        <div className={step === 2 ? "block space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Nom officiel (JOAFE)</label>
                                <input type="text" name="nomAsso" required={userType === "Association" && step === 2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Numéro RNA</label>
                                <input type="text" name="rnaNumber" required={userType === "Association" && step === 2} placeholder="W123456789" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Type d'association</label>
                                <select name="typeAsso" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none bg-white">
                                    <option value="Sport">Sport</option>
                                    <option value="Culture">Culture</option>
                                    <option value="Humanitaire">Humanitaire</option>
                                    <option value="Environnement">Environnement</option>
                                    <option value="Social">Social</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={prevStep} className="flex-1 border border-gray-200 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all">
                                    Précédent
                                </button>
                                <button type="button" onClick={nextStep} className="flex-1 bg-[#1a2f28] text-white font-bold py-3.5 rounded-xl hover:bg-[#254239] transition-all">
                                    Suivant
                                </button>
                            </div>
                        </div>

                        {/* Étape 3 : Coordonnées */}
                        <div className={step === 3 ? "block space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Adresse du siège social</label>
                                <input type="text" name="adresse" placeholder="123 rue de la Paix" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Site web ou Réseaux sociaux</label>
                                <input type="url" name="siteWeb" placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={prevStep} className="flex-1 border border-gray-200 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all">
                                    Précédent
                                </button>
                                <button type="submit" disabled={isPending} className="flex-1 bg-[#1a2f28] text-white font-bold py-3.5 rounded-xl hover:bg-[#254239] transition-all disabled:opacity-50">
                                    {isPending ? "Inscription..." : "S'inscrire"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

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