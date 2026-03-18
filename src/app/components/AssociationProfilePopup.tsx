'use client';

import { useState } from 'react';
import { updateAssociationProfile } from '@/app/actions/associationActions';

interface AssociationProfilePopupProps {
    association: any;
    userId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssociationProfilePopup({ association, userId, onClose, onSuccess }: AssociationProfilePopupProps) {
    const [formData, setFormData] = useState({
        typeAsso: association.typeAsso || '',
        siren: association.siren || '',
        description: association.description || '',
        objetSocial: association.objetSocial || '',
        siteWeb: association.siteWeb || '',
        telephone: association.telephone || '',
        adresse: association.adresse || '',
        codePostal: association.codePostal || '',
        ville: association.ville || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateAssociationProfile(userId, formData);
        if (res.success) {
            onSuccess();
            onClose();
        } else {
            alert("Erreur lors de la mise à jour : " + res.error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#1a2f28]/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="p-8 lg:p-10">
                    <header className="mb-8">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-icons-outlined text-3xl">business</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[#1a2f28] tracking-tight mb-2">Complétez votre profil</h2>
                        <p className="text-gray-500 font-medium">Pour une meilleure visibilité, nous vous invitons à renseigner ces informations.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Type d'association</label>
                                <select 
                                    name="typeAsso" 
                                    value={formData.typeAsso} 
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                >
                                    <option value="">Sélectionnez un type</option>
                                    <option value="Environnement">Environnement</option>
                                    <option value="Social">Social</option>
                                    <option value="Sport">Sport</option>
                                    <option value="Culture">Culture</option>
                                    <option value="Humanitaire">Humanitaire</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Numéro SIREN (optionnel)</label>
                                <input 
                                    type="text" 
                                    name="siren" 
                                    value={formData.siren} 
                                    onChange={handleChange}
                                    placeholder="Ex: 123456789"
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description courte</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange}
                                rows={3}
                                placeholder="Présentez brièvement votre association..."
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Objet social (votre mission)</label>
                            <input 
                                type="text" 
                                name="objetSocial" 
                                value={formData.objetSocial} 
                                onChange={handleChange}
                                placeholder="Ex: Protection de la biodiversité marine..."
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Téléphone</label>
                                <input 
                                    type="tel" 
                                    name="telephone" 
                                    value={formData.telephone} 
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Site Web</label>
                                <input 
                                    type="text" 
                                    name="siteWeb" 
                                    value={formData.siteWeb} 
                                    onChange={handleChange}
                                    placeholder="https://"
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Adresse postale</label>
                            <input 
                                type="text" 
                                name="adresse" 
                                value={formData.adresse} 
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Code Postal</label>
                                <input 
                                    type="text" 
                                    name="codePostal" 
                                    value={formData.codePostal} 
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ville</label>
                                <input 
                                    type="text" 
                                    name="ville" 
                                    value={formData.ville} 
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 bg-[#1a2f28] text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-900/10 hover:bg-[#254239] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-icons-outlined">save</span>}
                                Enregistrer les informations
                            </button>
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                Plus tard
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
