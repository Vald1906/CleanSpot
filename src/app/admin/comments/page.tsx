"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
    getReportedComments, 
    deleteReportedComment, 
    ignoreCommentReport 
} from "@/app/actions/adminCommentActions";

export default function AdminCommentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null); // Stocke l'ID du commentaire en cours d'action

    useEffect(() => {
        if (status === "unauthenticated" || (session?.user && session.user.statut_pro !== "Admin")) {
            router.push("/login");
        } else if (status === "authenticated") {
            loadComments();
        }
    }, [status, session, router]);

    const loadComments = async () => {
        setLoading(true);
        const res = await getReportedComments();
        if (res.success && res.data) {
            setComments(res.data);
        } else {
            console.error("Erreur chargement commentaires:", res.error);
        }
        setLoading(false);
    };

    const handleIgnore = async (commentId: number) => {
        setActionLoading(commentId);
        const res = await ignoreCommentReport(commentId);
        if (res.success) {
            setComments(prev => prev.filter(c => c.id !== commentId));
        } else {
            alert("Erreur lors de l'action.");
        }
        setActionLoading(null);
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce commentaire DÉFINITIVEMENT ?")) return;
        setActionLoading(commentId);
        const res = await deleteReportedComment(commentId);
        if (res.success) {
            setComments(prev => prev.filter(c => c.id !== commentId));
        } else {
            alert("Erreur lors de la suppression.");
        }
        setActionLoading(null);
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin text-teal-600">⏳</div>
            </div>
        );
    }

    if (!session || session.user.statut_pro !== "Admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f4f6f5] py-8">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => router.push('/admin/dashboard')}
                        className="p-2 hover:bg-white rounded-full transition-colors text-zinc-500 hover:text-zinc-800 shadow-sm border border-transparent hover:border-zinc-200"
                    >
                        <span className="material-icons-outlined text-xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1a2f28] flex items-center gap-2">
                            Modération des Commentaires
                            <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-full font-bold">
                                {comments.length} en attente
                            </span>
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Gérez les commentaires signalés par la communauté.</p>
                    </div>
                </div>

                {comments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-zinc-300 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-outlined text-4xl text-emerald-400">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-800 mb-2">Tout est calme</h3>
                        <p className="text-zinc-500 text-sm">Aucun commentaire n'a été signalé par les utilisateurs.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 hover:border-zinc-300 transition-all flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-icons-outlined text-rose-500 text-sm">flag</span>
                                        <span className="font-bold text-zinc-800 text-sm">Signalé sur l'événement : </span>
                                        <span className="text-teal-600 font-medium text-sm truncate max-w-[200px] block">{comment.spotTitle}</span>
                                    </div>
                                    
                                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 relative">
                                        <h4 className="font-bold text-zinc-800 text-xs mb-1">Auteur : {comment.author.split(" - ")[1] || comment.author}</h4>
                                        <p className="text-zinc-600 text-sm">"{comment.content}"</p>
                                        <div className="absolute top-4 right-4 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                                            {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row sm:flex-col justify-end gap-3 min-w-[160px]">
                                    <button 
                                        onClick={() => handleIgnore(comment.id)}
                                        disabled={actionLoading === comment.id}
                                        className="flex-1 sm:flex-none border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading === comment.id ? <span className="animate-spin">⏳</span> : <span className="material-icons-outlined text-base sm:text-lg">check_circle_outline</span>}
                                        Ignorer
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={actionLoading === comment.id}
                                        className="flex-1 sm:flex-none bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading === comment.id ? <span className="animate-spin">⏳</span> : <span className="material-icons-outlined text-base sm:text-lg">delete_outline</span>}
                                        Supprimer
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (!confirm("Voulez-vous vraiment suspendre cet utilisateur ? Il ne pourra plus se connecter.")) return;
                                            setActionLoading(comment.id);
                                            const authorParts = comment.author.split(" - ");
                                            const userId = authorParts[0];
                                            const { toggleUserBanStatus } = await import("@/app/actions/adminUserActions");
                                            const res = await toggleUserBanStatus(userId, true);
                                            if(res.success) {
                                                alert("L'utilisateur a été suspendu avec succès.");
                                            } else {
                                                alert("Erreur lors de la suspension de l'utilisateur.");
                                            }
                                            setActionLoading(null);
                                        }}
                                        disabled={actionLoading === comment.id}
                                        className="flex-1 sm:flex-none bg-zinc-800 text-white hover:bg-zinc-700 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading === comment.id ? <span className="animate-spin">⏳</span> : <span className="material-icons-outlined text-base sm:text-lg">block</span>}
                                        Bannir le membre
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
