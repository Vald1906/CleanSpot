'use client';

import { useState, useEffect, useRef } from 'react';

interface SpotFormData {
    type: 'Event' | 'Signalement';
    title: string;
    description: string;
    author: string;
    latitude: number;
    longitude: number;
    address: string;
    image: string;
    date: string;
    hours: string;
    urgency: string;
    materials: string[];
    maxParticipants: number;
}

const MATERIAL_OPTIONS = [
    { label: 'Plastique', icon: 'recycling', bg: 'bg-blue-50', text: 'text-blue-600', activeBg: 'bg-blue-500' },
    { label: 'Verre', icon: 'local_drink', bg: 'bg-orange-50', text: 'text-orange-600', activeBg: 'bg-orange-500' },
    { label: 'Compost', icon: 'eco', bg: 'bg-emerald-50', text: 'text-emerald-600', activeBg: 'bg-emerald-500' },
    { label: 'Papier/Carton', icon: 'description', bg: 'bg-amber-50', text: 'text-amber-600', activeBg: 'bg-amber-500' },
    { label: 'Métaux', icon: 'settings', bg: 'bg-slate-100', text: 'text-slate-600', activeBg: 'bg-slate-500' },
    { label: 'Textile', icon: 'checkroom', bg: 'bg-pink-50', text: 'text-pink-600', activeBg: 'bg-pink-500' },
    { label: 'Autre', icon: 'delete', bg: 'bg-purple-50', text: 'text-purple-600', activeBg: 'bg-purple-500' },
];

interface SpotFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SpotFormData) => Promise<void>;
    initialData?: Partial<SpotFormData> & { id?: number };
    mode: 'create' | 'edit';
    /** Coordonnées sélectionnées via la carte */
    pickedPosition?: { lat: number; lng: number } | null;
}

const emptyForm: SpotFormData = {
    type: 'Event',
    title: '',
    description: '',
    author: '',
    latitude: 0,
    longitude: 0,
    address: '',
    image: '',
    date: '',
    hours: '',
    urgency: '',
    materials: [],
    maxParticipants: 0,
};

export default function SpotFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
    pickedPosition,
}: SpotFormModalProps) {
    const [form, setForm] = useState<SpotFormData>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce : recherche d'adresse 500ms après la dernière frappe
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (form.address.length >= 3) {
            debounceRef.current = setTimeout(() => {
                searchAddress(form.address);
            }, 500);
        } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [form.address]);

    // Pré-remplir le formulaire en mode édition
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setForm({
                type: initialData.type || 'Event',
                title: initialData.title || '',
                description: initialData.description || '',
                author: initialData.author || '',
                latitude: initialData.latitude || 0,
                longitude: initialData.longitude || 0,
                address: initialData.address || '',
                image: initialData.image || '',
                date: initialData.date || '',
                hours: initialData.hours || '',
                urgency: initialData.urgency || '',
                materials: (initialData as any).materials || [],
                maxParticipants: (initialData as any).maxParticipants || 0,
            });
        } else if (mode === 'create') {
            setForm(emptyForm);
        }
    }, [mode, initialData, isOpen]);

    // Charger l'auteur mémorisé si on crée un nouveau spot
    useEffect(() => {
        if (mode === 'create' && isOpen) {
            const saved = typeof window !== 'undefined' ? localStorage.getItem('cleanspot_username') : null;
            if (saved) {
                setForm(prev => ({ ...prev, author: saved }));
            }
        }
    }, [mode, isOpen]);

    // Mise à jour quand l'utilisateur clique sur la carte
    useEffect(() => {
        if (pickedPosition) {
            setForm((prev) => ({
                ...prev,
                latitude: pickedPosition.lat,
                longitude: pickedPosition.lng,
            }));
            // Reverse geocoding pour obtenir l'adresse
            reverseGeocode(pickedPosition.lat, pickedPosition.lng);
        }
    }, [pickedPosition]);

    const reverseGeocode = async (lat: number, lng: number) => {
        setGeocoding(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'fr',
                        'User-Agent': 'CleanSpot-App/1.0 (https://github.com/Vald1906/CleanSpot)'
                    }
                }
            );

            if (!res.ok) {
                throw new Error(`Erreur HTTP Nominatim: ${res.status}`);
            }

            const data = await res.json();
            if (data.display_name) {
                setForm((prev) => ({ ...prev, address: data.display_name }));
            }
        } catch (err) {
            console.error('Erreur géocodage inverse:', err);
        }
        setGeocoding(false);
    };

    const searchAddress = async (query: string) => {
        if (query.length < 3) {
            setAddressSuggestions([]);
            return;
        }
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr`,
                {
                    headers: {
                        'Accept-Language': 'fr',
                        'User-Agent': 'CleanSpot-App/1.0 (https://github.com/Vald1906/CleanSpot)'
                    }
                }
            );

            if (!res.ok) {
                throw new Error(`Erreur HTTP Nominatim: ${res.status}`);
            }

            const data = await res.json();
            setAddressSuggestions(data);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Erreur recherche adresse:', err);
        }
    };

    const selectSuggestion = (suggestion: any) => {
        setForm((prev) => ({
            ...prev,
            address: suggestion.display_name,
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon),
        }));
        setShowSuggestions(false);
        setAddressSuggestions([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === 'author') {
            localStorage.setItem('cleanspot_username', value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(form);
            onClose();
        } catch (err) {
            console.error('Erreur soumission:', err);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    const typeConfig = {
        'Event': { icon: 'event', color: 'bg-emerald-500', label: 'Événement' },
        'Signalement': { icon: 'report_problem', color: 'bg-rose-500', label: 'Signalement' },
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-lg flex">
                <div className="w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-muted">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${typeConfig[form.type]?.color || 'bg-[#1a2f28]'} rounded-xl flex items-center justify-center text-white transition-all`}>
                                <span className="material-icons-outlined text-lg">{typeConfig[form.type]?.icon || 'add_location'}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[#1a2f28]">
                                    {mode === 'create' ? 'Nouveau Spot' : 'Modifier le Spot'}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {mode === 'create'
                                        ? 'Créer un événement ou un signalement'
                                        : 'Modifier les informations du spot'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-[#1a2f28] transition-all"
                        >
                            <span className="material-icons-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        {/* Type */}
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Type de spot
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['Event', 'Signalement'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setForm((prev) => {
                                            const newType = t;
                                            let newMax = prev.maxParticipants;
                                            if (newType === 'Signalement' && newMax > 5) newMax = 5;
                                            return { ...prev, type: newType, maxParticipants: newMax };
                                        })}
                                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${form.type === t
                                            ? 'border-[#1a2f28] bg-[#1a2f28] text-white shadow-lg'
                                            : 'border-muted bg-white text-muted-foreground hover:border-[#33a17b]'
                                            }`}
                                    >
                                        <span className="material-icons-outlined text-lg">{typeConfig[t].icon}</span>
                                        {typeConfig[t].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Types de matières */}
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Types de matières
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {MATERIAL_OPTIONS.map((mat) => {
                                    const isSelected = form.materials.includes(mat.label);
                                    return (
                                        <button
                                            key={mat.label}
                                            type="button"
                                            onClick={() => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    materials: isSelected
                                                        ? prev.materials.filter((m) => m !== mat.label)
                                                        : [...prev.materials, mat.label],
                                                }));
                                            }}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${isSelected
                                                ? `${mat.activeBg} text-white border-transparent shadow-md`
                                                : `${mat.bg} ${mat.text} border-transparent hover:border-current`
                                                }`}
                                        >
                                            <span className="material-icons-outlined text-sm">{mat.icon}</span>
                                            {mat.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {form.materials.length > 0 && (
                                <p className="text-[10px] text-[#33a17b] font-medium mt-1.5">
                                    {form.materials.length} matière(s) sélectionnée(s)
                                </p>
                            )}
                        </div>

                        {/* Titre */}
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Titre
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Ex: Grande collecte au Parc des Buttes-Chaumont"
                                required
                                className="w-full px-4 py-3 bg-muted/30 border border-muted rounded-xl text-sm text-[#1a2f28] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b] transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Décrivez le spot en quelques mots..."
                                className="w-full px-4 py-3 bg-muted/30 border border-muted rounded-xl text-sm text-[#1a2f28] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b] transition-all resize-none"
                            />
                        </div>

                        {/* Auteur */}
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Auteur
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={form.author}
                                onChange={handleChange}
                                placeholder="Votre nom ou pseudo"
                                required
                                className="w-full px-4 py-3 bg-muted/30 border border-muted rounded-xl text-sm text-[#1a2f28] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b] transition-all"
                            />
                        </div>

                        {/* Adresse avec autocomplete */}
                        <div className="relative">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Adresse <span className="normal-case font-normal">(ou cliquez sur la carte)</span>
                            </label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">location_on</span>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Tapez une adresse..."
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-muted rounded-xl text-sm text-[#1a2f28] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b] transition-all"
                                />
                                {geocoding && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#33a17b] text-xs animate-pulse">
                                        Géocodage...
                                    </span>
                                )}
                            </div>

                            {/* Suggestions dropdown */}
                            {showSuggestions && addressSuggestions.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full bg-white border border-muted rounded-xl shadow-lg overflow-hidden">
                                    {addressSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => selectSuggestion(s)}
                                            className="w-full text-left px-4 py-3 text-sm text-[#1a2f28] hover:bg-muted/50 transition-colors border-b border-muted/30 last:border-none flex items-start gap-2"
                                        >
                                            <span className="material-icons-outlined text-[#33a17b] text-sm mt-0.5 flex-shrink-0">place</span>
                                            <span className="line-clamp-2">{s.display_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Coordonnées affichées */}
                            {form.latitude !== 0 && form.longitude !== 0 && (
                                <p className="text-[10px] text-[#33a17b] font-medium mt-1.5 flex items-center gap-1">
                                    <span className="material-icons-outlined text-xs">check_circle</span>
                                    Position : {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                                </p>
                            )}
                        </div>

                        {/* Date + Heure (pour Event) */}
                        {form.type === 'Event' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-muted/30 border border-muted rounded-xl text-sm text-[#1a2f28] focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                        Heure
                                    </label>
                                    <input
                                        type="time"
                                        name="hours"
                                        value={form.hours}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-muted/30 border border-muted rounded-xl text-sm text-[#1a2f28] focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b] transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Urgence (pour Signalement) */}
                        {form.type === 'Signalement' && (
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                    Niveau d'urgence
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Faible', 'Moyen', 'Urgent'].map((u) => (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => setForm((prev) => ({ ...prev, urgency: u }))}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-2 ${form.urgency === u
                                                ? u === 'Urgent'
                                                    ? 'border-rose-500 bg-rose-500 text-white'
                                                    : u === 'Moyen'
                                                        ? 'border-amber-500 bg-amber-500 text-white'
                                                        : 'border-blue-500 bg-blue-500 text-white'
                                                : 'border-muted bg-white text-muted-foreground hover:border-[#33a17b]'
                                                }`}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Limite de participants */}
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Limite de participants {form.type === 'Signalement' && <span className="text-rose-500 font-black">(Max 5)</span>}
                            </label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">group</span>
                                <input
                                    type="number"
                                    name="maxParticipants"
                                    value={form.maxParticipants || ''}
                                    onChange={(e) => {
                                        let val = parseInt(e.target.value) || 0;
                                        if (form.type === 'Signalement' && val > 5) val = 5;
                                        if (val < 0) val = 0;
                                        setForm(prev => ({ ...prev, maxParticipants: val }));
                                    }}
                                    placeholder="Ex: 10 (0 pour illimité)"
                                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-muted rounded-xl text-sm text-[#1a2f28] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b] transition-all"
                                />
                            </div>
                        </div>

                        {/* Image (Local Upload) */}
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Photo du spot
                            </label>

                            {!form.image ? (
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setForm(prev => ({ ...prev, image: reader.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full py-8 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center gap-2 bg-muted/10 group-hover:bg-muted/30 group-hover:border-[#33a17b] transition-all">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-muted-foreground group-hover:text-[#33a17b] shadow-sm transition-all">
                                            <span className="material-icons-outlined">add_a_photo</span>
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground group-hover:text-[#1a2f28]">Cliquer pour ajouter une photo</p>
                                        <p className="text-[10px] text-muted-foreground/60 tracking-tight">JPG, PNG ou GIF (max. 5Mo)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden border border-muted group h-48">
                                    <img src={form.image} alt="Aperçu" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                                            className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all shadow-lg"
                                        >
                                            <span className="material-icons-outlined text-lg">delete</span>
                                        </button>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setForm(prev => ({ ...prev, image: reader.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <button
                                                type="button"
                                                className="w-10 h-10 bg-white text-[#1a2f28] rounded-full flex items-center justify-center hover:bg-muted transition-all shadow-lg"
                                            >
                                                <span className="material-icons-outlined text-lg">edit</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-bold flex items-center gap-1">
                                        <span className="material-icons-outlined text-[12px]">check_circle</span>
                                        Image sélectionnée
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-muted flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-muted/50 text-[#1a2f28] text-sm font-bold rounded-xl hover:bg-muted transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || !form.title || !form.author || !form.address}
                            className="flex-1 py-3 bg-[#1a2f28] text-white text-sm font-bold rounded-xl hover:bg-[#2a453c] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-outlined text-sm">
                                        {mode === 'create' ? 'add_location' : 'save'}
                                    </span>
                                    {mode === 'create' ? 'Créer le spot' : 'Enregistrer'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
