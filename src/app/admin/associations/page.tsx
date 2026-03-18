'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { getAllAssociations, updateAssociationVerification } from "@/app/actions/adminActions";

export default function AdminAssociationsPage() {
    const { data: session, status } = useSession();
    const [associations, setAssociations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (session?.user?.statut_pro !== "Admin") {
            redirect("/dashboard");
        }
        loadAssociations();
    }, [session, status]);

    async function loadAssociations() {
        setLoading(true);
        const res = await getAllAssociations();
        if (res.success && res.data) {
            setAssociations(res.data);
        }
        setLoading(false);
    }

    async function handleVerify(id: number, verify: boolean) {
        if (!confirm(`Voulez-vous ${verify ? 'valider' : 'réinitialiser'} cette association ?`)) return;
        
        setProcessingId(id);
        const res = await updateAssociationVerification(id, verify ? 1 : 0);
        if (res.success) {
            setAssociations(prev => prev.map(a => a.id === id ? { ...a, isVerified: verify ? 1 : 0 } : a));
        } else {
            alert("Erreur lors de la mise à jour");
        }
        setProcessingId(null);
    }

    if (loading && associations.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const pending = associations.filter(a => a.isVerified === 0);
    const verified = associations.filter(a => a.isVerified === 1);

    return (
        <div className="min-h-screen bg-[#f8faf9] p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                             <a href="/admin/dashboard" className="text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                                <span className="material-icons-outlined text-sm">arrow_back</span> Admin
                             </a>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Validation des Associations</h1>
                        <p className="text-slate-500 font-medium">Gérez les demandes d'accès pour les structures professionnelles.</p>
                    </div>
                </header>

                <div className="space-y-12">
                    {/* En attente */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Demandes en attente ({pending.length})
                        </h2>

                        {pending.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <span className="material-icons-outlined text-5xl text-slate-200 mb-4">check_circle_outline</span>
                                <p className="text-slate-400 font-medium">Aucune demande en attente pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {pending.map(asso => (
                                    <AssociationCard key={asso.id} asso={asso} onVerify={(v) => handleVerify(asso.id, v)} processing={processingId === asso.id} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Validées */}
                    {verified.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Associations validées ({verified.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {verified.map(asso => (
                                    <div key={asso.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                <span className="material-icons-outlined">verified</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{asso.nomAsso}</h3>
                                                <p className="text-xs text-slate-400">RNA: {asso.rnaNumber}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleVerify(asso.id, false)}
                                            className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                                        >
                                            Révoquer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

function AssociationCard({ asso, onVerify, processing }: { asso: any, onVerify: (v: boolean) => void, processing: boolean }) {
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Infos Principales */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {asso.typeAsso || "Association"}
                        </span>
                        <span className="text-slate-300 text-sm">•</span>
                        <span className="text-slate-400 text-xs font-medium">Inscrit le {new Date(asso.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{asso.nomAsso}</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                        "{asso.description || "Aucune description"}"
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                        <InfoItem label="Numéro RNA" value={asso.rnaNumber} icon="badge" />
                        <InfoItem label="SIREN" value={asso.siren || "N/A"} icon="business" />
                        <InfoItem label="Objet Social" value={asso.objetSocial || "N/A"} icon="work" />
                        <InfoItem label="Localisation" value={`${asso.ville} (${asso.codePostal})`} icon="place" />
                    </div>
                </div>

                {/* Infos Contact & Actions */}
                <div className="lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Responsable</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">
                                {asso.userPrenom?.[0]}{asso.userNom?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{asso.userPrenom} {asso.userNom}</p>
                                <p className="text-xs text-slate-500">{asso.userEmail}</p>
                            </div>
                        </div>
                        {asso.siteWeb && (
                            <a href={asso.siteWeb.startsWith('http') ? asso.siteWeb : `https://${asso.siteWeb}`} target="_blank" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                                <span className="material-icons-outlined text-sm">language</span>
                                {asso.siteWeb}
                            </a>
                        )}
                        {asso.telephone && (
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                                <span className="material-icons-outlined text-sm">phone</span>
                                {asso.telephone}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            disabled={processing}
                            onClick={() => onVerify(true)}
                            className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="material-icons-outlined text-lg">check</span>}
                            Valider
                        </button>
                        <button 
                            disabled={processing}
                            className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
                            title="Refuser / Supprimer"
                        >
                            <span className="material-icons-outlined">close</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon }: { label: string, value: string, icon: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-slate-300 text-lg mt-0.5">{icon}</span>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-700">{value}</p>
            </div>
        </div>
    );
}
