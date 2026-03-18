'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ContactMessage {
    id: number;
    userId: number | null;
    email: string;
    nom: string;
    subject: string;
    message: string;
    createdAt: string;
}

export default function AdminContacts() {
    const { data: session, status } = useSession();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    
    // --- NOUVEAUX ÉTATS POUR LA RÉPONSE ---
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    useEffect(() => {
        if (session?.user?.statut_pro !== "Admin") {
            return;
        }

        const fetchMessages = async () => {
            try {
                // We'll create a quick GET route to fetch messages. Wait, I should fetch it from a Server Component or create a GET endpoint.
                // Let me create the GET endpoint shortly!
                const res = await fetch('/api/admin/contacts');
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                } else {
                    setError("Impossible de récupérer les messages.");
                }
            } catch (err) {
                console.error(err);
                setError("Erreur réseau.");
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchMessages();
        }
    }, [session, status]);

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
        
        try {
            const res = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessages(messages.filter(msg => msg.id !== id));
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau.");
        }
    };

    const handleReply = async (id: number) => {
        if (!replyText.trim()) return;
        setIsSubmittingReply(true);

        try {
            const res = await fetch('/api/admin/contacts/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: id, replyText }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert("Réponse envoyée avec succès !");
                setReplyingTo(null);
                setReplyText("");
            } else {
                alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau.");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    if (status === "loading") return <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div></div>;
    
    if (session?.user?.statut_pro !== "Admin") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#f8faf9] p-6 lg:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-icons-outlined">arrow_back</span>
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Messages de Contact</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Consultez et gérez les messages envoyés depuis la page contact.</p>
                    </div>
                </header>

                {error && (
                    <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-6 flex items-center">
                        <span className="material-icons-outlined mr-2">error</span>
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-400 mx-auto mb-4"></div>
                        <p className="text-slate-500">Chargement des messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <span className="material-icons-outlined text-4xl">inbox</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 mb-2">Aucun message de contact</h2>
                        <p className="text-slate-500">Votre boîte de réception est vide pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 lg:items-start group transition-all hover:shadow-md">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center font-bold text-lg">
                                                {msg.nom.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 leading-tight">{msg.nom}</h3>
                                                <a href={`mailto:${msg.email}`} className="text-sm text-sky-600 hover:text-sky-800 transition-colors">{msg.email}</a>
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/60">
                                        <h4 className="font-bold text-slate-700 mb-2">{msg.subject}</h4>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                </div>
                                <div className="lg:w-auto w-full flex flex-col justify-end gap-2">
                                    <button 
                                        onClick={() => {
                                            if (replyingTo === msg.id) {
                                                setReplyingTo(null);
                                            } else {
                                                setReplyingTo(msg.id);
                                                setReplyText("");
                                            }
                                        }}
                                        className="flex items-center gap-2 text-indigo-500 hover:text-white bg-indigo-50 hover:bg-indigo-500 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-indigo-100 hover:border-transparent"
                                        title="Répondre au message"
                                    >
                                        <span className="material-icons-outlined text-[20px]">reply</span>
                                        {replyingTo === msg.id ? "Annuler" : "Répondre"}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(msg.id)}
                                        className="flex items-center gap-2 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-rose-100 hover:border-transparent"
                                        title="Supprimer ce message"
                                    >
                                        <span className="material-icons-outlined text-[20px]">delete</span>
                                        Supprimer
                                    </button>
                                </div>
                                
                                {/* Zone de Réponse */}
                                {replyingTo === msg.id && (
                                    <div className="w-full mt-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 lg:col-span-2">
                                        <h5 className="font-bold text-indigo-800 mb-3 text-sm">Répondre à {msg.nom}</h5>
                                        {!msg.userId && (
                                            <p className="text-xs text-rose-500 mb-3 bg-rose-50 p-2 rounded">Attention : Cet utilisateur n'était pas connecté. L'envoi de notification échouera.</p>
                                        )}
                                        <textarea 
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Votre réponse pour ${msg.nom}...`}
                                            className="w-full bg-white border border-indigo-100 rounded-xl p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 resize-none h-32 mb-4"
                                        ></textarea>
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => setReplyingTo(null)}
                                                className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button 
                                                onClick={() => handleReply(msg.id)}
                                                disabled={isSubmittingReply || !replyText.trim()}
                                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20"
                                            >
                                                {isSubmittingReply ? "Envoi..." : "Envoyer la réponse"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
