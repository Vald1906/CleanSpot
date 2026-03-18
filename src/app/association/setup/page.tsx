"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateAssociationProfile } from "@/app/actions/associationActions";

export default function AssociationSetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        siren: "",
        description: "",
        objetSocial: "",
        telephone: "",
        codePostal: "",
        ville: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!session?.user) {
            router.replace("/login");
            return;
        }
        if ((session.user as any).statut_pro !== "Association") {
            router.replace("/dashboard");
        }
    }, [session, status, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim() || !formData.telephone.trim() || !formData.ville.trim() || !formData.objetSocial.trim()) {
            setError("Veuillez renseigner les champs obligatoires : description, objet social, téléphone et ville.");
            return;
        }
        setLoading(true);
        setError(null);
        const userId = parseInt(session!.user!.id);
        const res = await updateAssociationProfile(userId, formData);
        if (res.success) {
            router.push("/dashboard");
        } else {
            setError("Erreur lors de la sauvegarde : " + res.error);
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2f28]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 font-sans">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#1a2f28] rounded-lg flex items-center justify-center shadow-sm">
                    <span className="material-icons-outlined text-white text-2xl">eco</span>
                </div>
                <h1 className="text-2xl font-bold text-[#1a2f28] tracking-tight">CleanSpot</h1>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                {/* Progress header */}
                <div className="bg-gradient-to-r from-[#1a2f28] to-[#254239] p-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <span className="material-icons-outlined text-3xl">business</span>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Étape finale</p>
                            <h2 className="text-2xl font-bold tracking-tight">Complétez votre profil</h2>
                        </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Bienvenue sur CleanSpot ! Avant d'accéder à votre espace, veuillez compléter les informations de votre association.
                        Cela permet aux bénévoles de vous identifier et de vous faire confiance.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl flex items-center gap-2">
                            <span className="material-icons-outlined text-sm">error_outline</span>
                            {error}
                        </div>
                    )}

                    {/* SIREN */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                            Numéro SIREN <span className="text-gray-300 font-normal">(optionnel)</span>
                        </label>
                        <input
                            type="text"
                            name="siren"
                            value={formData.siren}
                            onChange={handleChange}
                            placeholder="Ex: 123456789"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all font-mono"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                            Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            placeholder="Présentez brièvement votre association, votre histoire, vos valeurs..."
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Objet social */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                            Objet social <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="objetSocial"
                            value={formData.objetSocial}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Protection de la biodiversité marine..."
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                            Téléphone <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            required
                            placeholder="06 00 00 00 00"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>

                    {/* Code postal + Ville */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Code Postal</label>
                            <input
                                type="text"
                                name="codePostal"
                                value={formData.codePostal}
                                onChange={handleChange}
                                placeholder="75001"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                                Ville <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="ville"
                                value={formData.ville}
                                onChange={handleChange}
                                required
                                placeholder="Paris"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1a2f28] text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-900/10 hover:bg-[#254239] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading
                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            : <span className="material-icons-outlined">arrow_forward</span>
                        }
                        {loading ? "Enregistrement..." : "Accéder à mon espace"}
                    </button>
                </form>
            </div>

            <p className="mt-8 text-xs text-gray-400">
                Ces informations sont visibles par les bénévoles et les administrateurs.
            </p>
        </div>
    );
}
