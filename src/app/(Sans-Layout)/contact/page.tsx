"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";


export default function ContactPage() {
    const searchParams = useSearchParams();
    const replyTo = searchParams.get('replyTo');

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', subject: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const { data: session } = useSession();

    // Initialiser le sujet si replyTo est présent
    useEffect(() => {
        if (replyTo) {
            setFormData(prev => ({ ...prev, subject: `Re: ${replyTo}` }));
        }
    }, [replyTo]);

    // Pré-remplir les champs si l'utilisateur est connecté
    useEffect(() => {
        if (session?.user) {
            // Le nom dans NextAuth (souvent "Prénom Nom" ou juste "Nom")
            const fullName = session.user.name || "";
            const nameParts = fullName.split(" ");
            const userPrenom = nameParts[0] || "";
            const userNom = nameParts.slice(1).join(" ") || "";

            setFormData(prev => ({
                ...prev,
                nom: prev.nom || userNom,
                prenom: prev.prenom || userPrenom,
                email: prev.email || session.user?.email || ""
            }));
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: `${formData.prenom} ${formData.nom}`.trim(),
                    email: formData.email,
                    subject: formData.subject || "Message depuis la page Contact",
                    message: formData.message,
                    userId: session?.user?.id ? Number(session.user.id) : null
                }),
            });

            if (res.ok) {
                setIsSubmitted(true);
                setFormData({ nom: '', prenom: '', email: '', subject: '', message: '' });
            } else {
                setErrorMsg("Une erreur s'est produite. Veuillez réessayer.");
            }
        } catch (error) {
            setErrorMsg("Erreur réseau. Veuillez vérifier votre connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-[#F8FAFC] font-sans flex-col">

            <main className="flex-grow flex items-center justify-center p-6 mt-12">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

                    {/* --- SECTION GAUCHE : LE FORMULAIRE --- */}
                    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="p-8 flex flex-col gap-6">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1a2f28] leading-tight">
                                    {isSubmitted ? "Message envoyé !" : "Envoyez-nous un message"}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1 italic">
                                    {isSubmitted
                                        ? "Merci ! Nous reviendrons vers vous sous 24h."
                                        : "Notre équipe vous répondra dans les plus brefs délais."
                                    }
                                </p>
                            </div>

                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a2f28] mb-1.5 block opacity-70">
                                                Nom
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                placeholder="Nom"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-[#1a2f28]/5 focus:border-[#1a2f28]/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a2f28] mb-1.5 block opacity-70">
                                                Prénom
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                placeholder="Prénom"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-[#1a2f28]/5 focus:border-[#1a2f28]/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a2f28] mb-1.5 block opacity-70">
                                            Email
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="jean@exemple.fr"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-[#1a2f28]/5 focus:border-[#1a2f28]/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a2f28] mb-1.5 block opacity-70">
                                            Sujet
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="Ex: Demande de renseignement"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-[#1a2f28]/5 focus:border-[#1a2f28]/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a2f28] mb-1.5 block opacity-70">
                                            Message
                                        </label>
                                        <textarea
                                            required
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Comment pouvons-nous vous aider ?"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-[#1a2f28]/5 focus:border-[#1a2f28]/20 transition-all h-32 resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Verification Turnstile - Adaptée */}
                                    <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex items-center justify-center">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1a2f28]">
                                                    <path d="M12 2L3 7V12C3 17.5 7 21.3 12 22C17 21.3 21 17.5 21 12V7L12 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="absolute inset-0 rounded-full animate-pulse bg-[#1a2f28]/10"></span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Vérification Cloudflare active</span>
                                        </div>
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png"
                                            alt="Cloudflare"
                                            className="h-3 opacity-40 grayscale"
                                        />
                                    </div>

                                    {errorMsg && (
                                        <div className="text-red-500 text-sm font-semibold">{errorMsg}</div>
                                    )}
                                    <button disabled={isLoading} type="submit" className="w-full bg-[#1a2f28] hover:bg-[#254239] text-white text-sm font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#1a2f28]/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                                        {isLoading ? "Envoi en cours..." : "Envoyer le message"}
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="w-full bg-slate-100 text-[#1a2f28] text-sm font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Rédiger un autre message
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- SECTION DROITE : INFOS & CARTE --- */}
                    <div className="flex flex-col gap-6 h-full">
                        <div className="px-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1a2f28]/5 text-[#1a2f28] border border-[#1a2f28]/10">
                                Contact
                            </span>
                            <h1 className="text-4xl font-semibold text-slate-800 leading-tight mt-4">
                                Une question ? <br />
                                <span className="text-[#1a2f28]">On s'occupe de tout.</span>
                            </h1>
                        </div>

                        <div className="bg-[#1a2f28]/5 backdrop-blur-md border border-[#1a2f28]/10 rounded-[28px] p-6 flex items-center justify-around shadow-sm">
                            <div className="text-center px-4">
                                <p className="text-[9px] uppercase tracking-widest text-[#1a2f28] font-bold mb-1 opacity-60">Email</p>
                                <p className="text-sm font-semibold text-[#1a2f28]">contact@cleanspot.fr</p>
                            </div>
                            <div className="w-[1px] h-10 bg-[#1a2f28]/10"></div>
                            <div className="text-center px-4">
                                <p className="text-[9px] uppercase tracking-widest text-[#1a2f28] font-bold mb-1 opacity-60">Téléphone</p>
                                <p className="text-sm font-semibold text-[#1a2f28]">+33 1 23 45 67 89</p>
                            </div>
                        </div>

                        {/* Zone Carte Dark Mode */}
                        <div className="relative flex-grow h-[430px] w-full bg-[#0F172A] rounded-[32px] overflow-hidden border border-slate-800 shadow-xl group">
                            <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: `linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
                            </div>

                            <img
                                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800"
                                alt="Localisation Paris"
                                className="w-full h-full object-cover grayscale opacity-30 mix-blend-overlay transition-all duration-700 group-hover:scale-105"
                            />

                            {/* Point de localisation - Adapté en vert sombre/blanc */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="h-20 w-20 rounded-full border border-white/20 animate-ping"></div>
                                <div className="h-3 w-3 bg-white rounded-full shadow-[0_0_20px_#fff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 bg-[#1a2f28]/90 backdrop-blur-xl p-6 rounded-[24px] flex items-center justify-between border border-white/10 shadow-2xl">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold">Siège Social</p>
                                    <p className="text-sm font-semibold text-white mt-1">Paris Hub 01, France</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-mono text-white/80 font-bold">LIVE STATUS</p>
                                    <p className="text-[8px] font-mono text-white/40 mt-0.5">48.8566° N, 2.3522° E</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>

    );
}