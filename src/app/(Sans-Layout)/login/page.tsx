'use client';

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkAssociationProfileComplete } from "@/app/actions/associationActions";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    const router = useRouter();
    const { data: session, status } = useSession();

    // Une fois signIn() réussi, on attend que useSession() ait la session fraîche
    useEffect(() => {
        if (!redirecting) return;
        if (status === "loading") return;
        if (status !== "authenticated" || !session?.user) return;

        const statut_pro = (session.user as any)?.statut_pro;
        const userId = session.user.id ? parseInt(session.user.id) : null;

        if (statut_pro === "Association" && userId) {
            checkAssociationProfileComplete(userId).then(({ complete }) => {
                router.push(complete ? "/association/dashboard" : "/association/setup");
            });
        } else {
            router.push("/dashboard");
        }
    }, [session, status, redirecting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Email ou mot de passe incorrect.");
            setIsPending(false);
        } else {
            // Déclenche l'useEffect qui attend la session fraîche
            setRedirecting(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 font-sans relative">
            {/* ... ton design reste identique ... */}
            <div className="absolute top-8 left-8">
                <a href="/dashboard" className="group flex items-center gap-2 text-gray-400 hover:text-[#1a2f28]">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                        <span className="material-icons-outlined text-sm">arrow_back</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Fil d'actualité
                    </span>
                </a>
            </div>

            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#1a2f28] rounded-lg flex items-center justify-center shadow-sm">
                    <span className="material-icons-outlined text-white text-2xl">eco</span>
                </div>
                <h1 className="text-2xl font-bold text-[#1a2f28] tracking-tight">CleanSpot</h1>
            </div>

            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-[#1a2f28] mb-1">Connexion</h2>
                <p className="text-[#1a2f28]/70 text-sm mb-8 font-medium">Bienvenue sur votre espace CleanSpot</p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}

                {/* IMPORTANT : onSubmit={handleSubmit} et PAS action={formAction} */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-[#1a2f28] mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="exemple@mail.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-[#1a2f28]">Mot de passe</label>
                            <a href="#" className="text-xs font-medium text-[#1a2f28] hover:underline opacity-80">Mot de passe oublié ?</a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a2f28] focus:ring-2 focus:ring-[#1a2f28]/10 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#1a2f28] text-white font-bold py-3.5 rounded-xl hover:bg-[#254239] transition-all disabled:opacity-70 mb-4"
                    >
                        {isPending ? "Connexion..." : "Se Connecter"}
                    </button>

                    <p className="text-center text-sm text-[#1a2f28]/60 font-medium">
                        Pas encore de compte ?{" "}
                        <a href="/register" className="text-[#1a2f28] font-bold hover:underline">
                            Créer un compte
                        </a>
                    </p>
                </form>

                {/* ... tes boutons Google/GitHub ... */}
            </div>
        </div>
    );
}