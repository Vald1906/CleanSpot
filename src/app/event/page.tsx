'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import NavBar from "@/app/components/navbar";
import { getSpotsFromDb, createSpot, toggleParticipation, toggleFavorite, getParticipations, getComments, addComment } from "@/app/actions/spotActions";
import SpotFormModal from "@/app/components/SpotFormModal";

// Config des matières pour l'affichage
const MATERIAL_OPTIONS = [
    { label: 'Plastique', icon: 'recycling', bg: 'bg-blue-50', text: 'text-blue-600', activeBg: 'bg-blue-500' },
    { label: 'Verre', icon: 'local_drink', bg: 'bg-orange-50', text: 'text-orange-600', activeBg: 'bg-orange-500' },
    { label: 'Compost', icon: 'eco', bg: 'bg-emerald-50', text: 'text-emerald-600', activeBg: 'bg-emerald-500' },
    { label: 'Papier/Carton', icon: 'description', bg: 'bg-amber-50', text: 'text-amber-600', activeBg: 'bg-amber-500' },
    { label: 'Métaux', icon: 'settings', bg: 'bg-slate-100', text: 'text-slate-600', activeBg: 'bg-slate-500' },
    { label: 'Textile', icon: 'checkroom', bg: 'bg-pink-50', text: 'text-pink-600', activeBg: 'bg-pink-500' },
    { label: 'Autre', icon: 'delete', bg: 'bg-purple-50', text: 'text-purple-600', activeBg: 'bg-purple-500' },
];

const MATERIAL_VISUALS: Record<string, { icon: string; bg: string; text: string }> = {};
MATERIAL_OPTIONS.forEach(m => { MATERIAL_VISUALS[m.label] = { icon: m.icon, bg: m.bg, text: m.text }; });

// Options de tri
const SORT_OPTIONS = [
    { value: 'date_asc', label: 'Date (plus proche)' },
    { value: 'date_desc', label: 'Date (plus loin)' },
    { value: 'distance', label: 'Le plus proche' },
    { value: 'title_asc', label: 'Titre (A → Z)' },
    { value: 'title_desc', label: 'Titre (Z → A)' },
    { value: 'recent', label: 'Plus récent' },
];

// Helper calendrier
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Lundi = 0
}
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// --- COMPOSANTS AUXILIAIRES ---

function EventSkeleton() {
    return (
        <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm animate-pulse">
            <div className="h-52 bg-slate-200"></div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                        <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
                    </div>
                    <div className="w-12 h-14 bg-slate-200 rounded-2xl"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                    <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
                    <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
                </div>
            </div>
        </div>
    );
}

export default function EventPage() {
    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // --- FILTRES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('date_asc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Distance
    const [distanceKm, setDistanceKm] = useState(50);
    const [distanceEnabled, setDistanceEnabled] = useState(false);
    const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
    const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

    // Calendrier
    const now = new Date();
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [calMonth, setCalMonth] = useState(now.getMonth());

    // Interactions sociales
    const [participationCounts, setParticipationCounts] = useState<Record<number, number>>({});
    const [userParticipations, setUserParticipations] = useState<Record<number, boolean>>({});
    const [userFavorites, setUserFavorites] = useState<Record<number, boolean>>({});

    // Commentaires
    const [expandedComments, setExpandedComments] = useState<number | null>(null);
    const [commentsMap, setCommentsMap] = useState<Record<number, any[]>>({});
    const [commentInput, setCommentInput] = useState('');
    const [commentAuthor, setCommentAuthor] = useState('');
    const [userName, setUserName] = useState('Utilisateur');

    // Verrou pour éviter les erreurs "InvalidStateError" sur navigator.share (un seul partage à la fois)
    const isSharingRef = useRef(false);

    // Charger l'auteur mémorisé au montage
    useEffect(() => {
        const saved = localStorage.getItem('cleanspot_username');
        if (saved) {
            setUserName(saved);
            setCommentAuthor(saved);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        const res = await getSpotsFromDb();
        if (res.success) {
            const eventsOnly = res.data.filter((s: any) => s.type === 'Event');
            setAllEvents(eventsOnly);
            for (const ev of eventsOnly) {
                const pRes = await getParticipations(ev.id);
                if (pRes.success) {
                    setParticipationCounts(prev => ({ ...prev, [ev.id]: pRes.count ?? 0 }));
                    setUserParticipations(prev => ({
                        ...prev,
                        [ev.id]: (pRes.data ?? []).some((p: any) => p.userName === userName),
                    }));
                }
            }
        }
        setLoading(false);
    };

    // --- Géolocalisation ---
    const requestGeolocation = () => {
        if (!navigator.geolocation) { setGeoStatus('denied'); return; }
        setGeoStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGeoStatus('granted');
                setDistanceEnabled(true);
            },
            () => { setGeoStatus('denied'); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Haversine
    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getEventDistance = (ev: any): number | null => {
        if (!userPos || !ev.latitude || !ev.longitude) return null;
        return haversineKm(userPos.lat, userPos.lng, ev.latitude, ev.longitude);
    };

    // --- FILTRAGE & TRI ---
    const filteredEvents = useMemo(() => {
        let result = [...allEvents];

        // 1. Recherche textuelle
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(ev =>
                ev.title?.toLowerCase().includes(q) ||
                ev.description?.toLowerCase().includes(q) ||
                ev.address?.toLowerCase().includes(q) ||
                ev.author?.toLowerCase().includes(q)
            );
        }

        // 2. Filtre matières
        if (selectedMaterials.length > 0) {
            result = result.filter(ev => {
                const mats: string[] = ev.materials
                    ? (typeof ev.materials === 'string' ? JSON.parse(ev.materials) : ev.materials)
                    : [];
                return selectedMaterials.some(sm => mats.includes(sm));
            });
        }

        // 3. Filtre date
        if (selectedDate) {
            result = result.filter(ev => {
                if (!ev.date) return false;
                const evDate = new Date(ev.date).toISOString().slice(0, 10);
                return evDate === selectedDate;
            });
        }

        // 4. Filtre distance
        if (distanceEnabled && userPos) {
            result = result.filter(ev => {
                const d = getEventDistance(ev);
                return d !== null && d <= distanceKm;
            });
        }

        // 5. Tri
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date_asc': {
                    const da = a.date ? new Date(a.date).getTime() : Infinity;
                    const db2 = b.date ? new Date(b.date).getTime() : Infinity;
                    return da - db2;
                }
                case 'date_desc': {
                    const da = a.date ? new Date(a.date).getTime() : 0;
                    const db2 = b.date ? new Date(b.date).getTime() : 0;
                    return db2 - da;
                }
                case 'title_asc':
                    return (a.title || '').localeCompare(b.title || '', 'fr');
                case 'title_desc':
                    return (b.title || '').localeCompare(a.title || '', 'fr');
                case 'distance': {
                    const da = getEventDistance(a) ?? Infinity;
                    const db2 = getEventDistance(b) ?? Infinity;
                    return da - db2;
                }
                case 'recent': {
                    const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return cb - ca;
                }
                default:
                    return 0;
            }
        });

        return result;
    }, [allEvents, searchQuery, selectedMaterials, selectedDate, sortBy, distanceEnabled, distanceKm, userPos]);

    // --- Handlers ---
    const handleCreateSpot = async (data: any) => {
        await createSpot(data);
        setShowForm(false);
        await loadEvents();
    };

    const handleParticipate = async (spotId: number) => {
        const res = await toggleParticipation(spotId, userName);
        if (res.success) {
            setUserParticipations(prev => ({ ...prev, [spotId]: res.participating ?? false }));
            setParticipationCounts(prev => ({
                ...prev,
                [spotId]: (prev[spotId] || 0) + (res.participating ? 1 : -1),
            }));
        }
    };

    const handleFavorite = async (spotId: number) => {
        const res = await toggleFavorite(spotId, userName);
        if (res.success) {
            setUserFavorites(prev => ({ ...prev, [spotId]: res.favorited ?? false }));
        }
    };

    const handleToggleComments = async (spotId: number) => {
        if (expandedComments === spotId) {
            setExpandedComments(null);
            return;
        }
        setExpandedComments(spotId);
        const res = await getComments(spotId);
        if (res.success) {
            setCommentsMap(prev => ({ ...prev, [spotId]: res.data }));
        }
    };

    const handleAddComment = async (spotId: number) => {
        if (!commentInput.trim() || !commentAuthor.trim()) return;
        const res = await addComment(spotId, commentAuthor, commentInput);
        if (res.success) {
            setCommentInput('');
            const cRes = await getComments(spotId);
            if (cRes.success) {
                setCommentsMap(prev => ({ ...prev, [spotId]: cRes.data }));
            }
        }
    };

    const toggleMaterialFilter = (label: string) => {
        setSelectedMaterials(prev =>
            prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
        );
    };

    const handleShare = async (event: any) => {
        if (isSharingRef.current) return;

        const shareData = {
            title: event.title,
            text: `Rejoignez-moi pour cet événement : ${event.title} le ${new Date(event.date).toLocaleDateString('fr-FR')}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                isSharingRef.current = true;
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Lien copié dans le presse-papier !');
            }
        } catch (err: any) {
            // "AbortError" est levé si l'utilisateur annule le partage, on l'ignore silencieusement
            if (err.name !== 'AbortError') {
                console.error('Erreur partage:', err);
            }
        } finally {
            isSharingRef.current = false;
        }
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(prev => prev === dateStr ? null : dateStr);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedMaterials([]);
        setSelectedDate(null);
        setSortBy('date_asc');
        setCalYear(now.getFullYear());
        setCalMonth(now.getMonth());
        setDistanceEnabled(false);
        setDistanceKm(50);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return { month: '', day: '' };
        const d = new Date(dateStr);
        return {
            month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
            day: d.getDate().toString(),
        };
    };

    const hasActiveFilters = searchQuery.trim() !== '' || selectedMaterials.length > 0 || selectedDate !== null || distanceEnabled;

    // --- Calendrier ---
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);

    const prevMonth = () => {
        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
        else setCalMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
        else setCalMonth(m => m + 1);
    };

    // Dates des events pour marquer le calendrier
    const eventDatesInMonth = useMemo(() => {
        const set = new Set<number>();
        allEvents.forEach(ev => {
            if (!ev.date) return;
            const d = new Date(ev.date);
            if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
                set.add(d.getDate());
            }
        });
        return set;
    }, [allEvents, calYear, calMonth]);

    return (
        <div className="bg-[#f4f6f5] text-foreground min-h-screen">
            <NavBar />
            <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col lg:flex-row gap-8">
                {/* Sidebar - Filtres */}
                <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-6 lg:self-start space-y-5">
                    {/* Filtre Matières */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-icons-outlined text-base">recycling</span>
                            Type de déchets
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {MATERIAL_OPTIONS.map((mat) => {
                                const isActive = selectedMaterials.includes(mat.label);
                                return (
                                    <button
                                        key={mat.label}
                                        onClick={() => toggleMaterialFilter(mat.label)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border-2 ${isActive
                                            ? `${mat.activeBg} text-white border-transparent shadow-md scale-105`
                                            : `${mat.bg} ${mat.text} border-transparent hover:border-current hover:shadow-sm`
                                            }`}
                                    >
                                        <span className="material-icons-outlined text-sm">{mat.icon}</span>
                                        {mat.label}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedMaterials.length > 0 && (
                            <p className="text-[11px] text-[#33a17b] font-semibold mt-3">
                                {selectedMaterials.length} filtre(s) actif(s)
                            </p>
                        )}
                    </div>

                    {/* Filtre Distance */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-icons-outlined text-base">near_me</span>
                                Distance
                            </h3>
                            {distanceEnabled && (
                                <button
                                    onClick={() => setDistanceEnabled(false)}
                                    className="text-[11px] text-rose-500 font-bold hover:underline"
                                >
                                    Désactiver
                                </button>
                            )}
                        </div>
                        {geoStatus === 'idle' && (
                            <button
                                onClick={requestGeolocation}
                                className="w-full py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-[#1a2f28] hover:bg-emerald-50 hover:border-[#33a17b] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-outlined text-base">my_location</span>
                                Activer la géolocalisation
                            </button>
                        )}
                        {geoStatus === 'loading' && (
                            <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
                                <div className="w-5 h-5 border-2 border-slate-200 border-t-[#1a2f28] rounded-full animate-spin"></div>
                                Localisation en cours...
                            </div>
                        )}
                        {geoStatus === 'denied' && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-600">
                                <div className="flex items-center gap-1.5 font-bold mb-1">
                                    <span className="material-icons-outlined text-base">location_off</span>
                                    Accès refusé
                                </div>
                                <p className="text-[11px] leading-relaxed">Autorisez la géolocalisation dans votre navigateur pour utiliser ce filtre.</p>
                            </div>
                        )}
                        {geoStatus === 'granted' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Rayon max</span>
                                    <span className={`text-sm font-bold ${distanceEnabled ? 'text-[#33a17b]' : 'text-[#1a2f28]'}`}>{distanceKm} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={distanceKm}
                                    onChange={(e) => {
                                        setDistanceKm(Number(e.target.value));
                                        if (!distanceEnabled) setDistanceEnabled(true);
                                    }}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#33a17b]"
                                />
                                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                                    <span>1 km</span>
                                    <span>50 km</span>
                                </div>
                                {!distanceEnabled && (
                                    <button
                                        onClick={() => setDistanceEnabled(true)}
                                        className="w-full py-2.5 bg-[#1a2f28] text-white text-xs font-bold rounded-xl hover:bg-[#2a453c] transition-all"
                                    >
                                        Appliquer le filtre distance
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Calendrier */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-icons-outlined text-base">calendar_today</span>
                            Date
                        </h3>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-[#1a2f28]">{MONTH_NAMES[calMonth]} {calYear}</span>
                                <div className="flex gap-1">
                                    <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors shadow-sm">
                                        <span className="material-icons-outlined text-base text-slate-500">chevron_left</span>
                                    </button>
                                    <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors shadow-sm">
                                        <span className="material-icons-outlined text-base text-slate-500">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                    <span key={`header-${i}`} className="text-[11px] font-bold text-slate-400 pb-1">{d}</span>
                                ))}
                                {[...Array(firstDay)].map((_, i) => (
                                    <span key={`empty-${i}`}></span>
                                ))}
                                {[...Array(daysInMonth)].map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const isSelected = selectedDate === dateStr;
                                    const hasEvent = eventDatesInMonth.has(day);
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => handleDateClick(day)}
                                            className={`text-xs py-1.5 rounded-lg font-medium transition-all relative ${isSelected
                                                ? 'bg-[#1a2f28] text-white shadow-md'
                                                : hasEvent
                                                    ? 'text-[#33a17b] font-bold hover:bg-emerald-50'
                                                    : 'text-[#1a2f28] hover:bg-white'
                                                }`}
                                        >
                                            {day}
                                            {hasEvent && (
                                                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all ${isSelected ? 'bg-emerald-400' : 'bg-[#33a17b] shadow-[0_0_5px_rgba(51,161,123,0.5)] animate-bounce-short'}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="mt-3 text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                            >
                                <span className="material-icons-outlined text-sm">close</span>
                                Effacer la date
                            </button>
                        )}
                    </div>

                    {/* Bouton reset */}
                    <button
                        onClick={resetFilters}
                        disabled={!hasActiveFilters}
                        className={`w-full py-3.5 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${hasActiveFilters
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-sm'
                            : 'bg-white/50 text-slate-400 cursor-not-allowed border border-slate-200/60'
                            }`}
                    >
                        <span className="material-icons-outlined text-base">restart_alt</span>
                        Réinitialiser les filtres
                        {hasActiveFilters && (
                            <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[11px] font-bold">
                                {(searchQuery.trim() ? 1 : 0) + selectedMaterials.length + (selectedDate ? 1 : 0) + (distanceEnabled ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-col gap-5 mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-[#1a2f28]">Événements de nettoyage</h1>
                                <p className="text-sm text-slate-500 mt-1">Rejoignez un événement près de chez vous</p>
                            </div>
                            {/* Barre de recherche */}
                            <div className="relative w-full sm:max-w-sm">
                                <span className="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un lieu, un parc, une rue..."
                                    className="w-full pl-11 pr-10 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30 focus:border-[#33a17b]/30 transition-all text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                                    >
                                        <span className="material-icons-outlined text-sm text-slate-500">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[#1a2f28]">
                                Événements <span className="text-slate-400 font-normal text-sm">({filteredEvents.length}{filteredEvents.length !== allEvents.length ? ` / ${allEvents.length}` : ''})</span>
                            </h2>
                            {/* Menu de tri */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className="flex items-center gap-2 text-xs font-bold text-[#1a2f28] px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <span className="material-icons-outlined text-base">sort</span>
                                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                                    <span className="material-icons-outlined text-base">{showSortMenu ? 'expand_less' : 'expand_more'}</span>
                                </button>
                                {showSortMenu && (
                                    <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20 min-w-[200px]">
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                                                className={`w-full text-left px-4 py-3 text-xs font-medium transition-colors ${sortBy === opt.value
                                                    ? 'bg-[#1a2f28] text-white'
                                                    : 'text-[#1a2f28] hover:bg-slate-50'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filtres actifs (badges) */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {searchQuery.trim() && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#1a2f28] shadow-sm">
                                    <span className="material-icons-outlined text-sm">search</span>
                                    &quot;{searchQuery}&quot;
                                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-rose-500 transition-colors">
                                        <span className="material-icons-outlined text-sm">close</span>
                                    </button>
                                </span>
                            )}
                            {selectedMaterials.map(mat => {
                                const vis = MATERIAL_VISUALS[mat];
                                return (
                                    <span key={mat} className={`flex items-center gap-1.5 px-3 py-1.5 ${vis?.bg || 'bg-white'} border border-slate-200 rounded-xl text-xs font-semibold ${vis?.text || 'text-[#1a2f28]'} shadow-sm`}>
                                        <span className="material-icons-outlined text-sm">{vis?.icon}</span>
                                        {mat}
                                        <button onClick={() => toggleMaterialFilter(mat)} className="ml-1 hover:text-rose-500 transition-colors">
                                            <span className="material-icons-outlined text-sm">close</span>
                                        </button>
                                    </span>
                                );
                            })}
                            {selectedDate && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#1a2f28] shadow-sm">
                                    <span className="material-icons-outlined text-sm">event</span>
                                    {new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    <button onClick={() => setSelectedDate(null)} className="ml-1 hover:text-rose-500 transition-colors">
                                        <span className="material-icons-outlined text-sm">close</span>
                                    </button>
                                </span>
                            )}
                            {distanceEnabled && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-600 shadow-sm">
                                    <span className="material-icons-outlined text-sm">near_me</span>
                                    {'< '}{distanceKm} km
                                    <button onClick={() => setDistanceEnabled(false)} className="ml-1 hover:text-rose-500 transition-colors">
                                        <span className="material-icons-outlined text-sm">close</span>
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Loading Skeletons */}
                    {loading && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => <EventSkeleton key={i} />)}
                        </div>
                    )}

                    {/* Grille d'événements */}
                    {!loading && filteredEvents.length > 0 && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredEvents.map((event) => {
                                const { month, day } = formatDate(event.date);
                                const materials: string[] = event.materials ? (typeof event.materials === 'string' ? JSON.parse(event.materials) : event.materials) : [];
                                const isFav = userFavorites[event.id] || false;
                                const isParticipating = userParticipations[event.id] || false;
                                const pCount = participationCounts[event.id] || 0;
                                const spotComments = commentsMap[event.id] || [];
                                const isCommentsOpen = expandedComments === event.id;
                                const dist = getEventDistance(event);

                                return (
                                    <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 hover:shadow-lg transition-all group flex flex-col">
                                        <div className="relative h-52">
                                            <img
                                                src={event.image || `https://images.unsplash.com/photo-1595273670150-db0a3bf4424e?q=80&w=600&auto=format&fit=crop`}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                            {month && (
                                                <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 text-center shadow-lg min-w-[56px]">
                                                    <span className="block text-[11px] font-bold text-slate-500 uppercase leading-none">{month}</span>
                                                    <span className="block text-2xl font-bold text-[#1a2f28] leading-tight">{day}</span>
                                                </div>
                                            )}
                                            {dist !== null && (
                                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
                                                    <span className="text-[11px] font-bold text-[#1a2f28] flex items-center gap-1">
                                                        <span className="material-icons-outlined text-sm text-[#33a17b]">near_me</span>
                                                        {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <button
                                                    onClick={() => handleShare(event)}
                                                    className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-[#1a2f28] shadow-lg hover:scale-110 transition-all"
                                                    title="Partager"
                                                >
                                                    <span className="material-icons-outlined text-xl">share</span>
                                                </button>
                                                <button
                                                    onClick={() => handleFavorite(event.id)}
                                                    className={`w-10 h-10 ${isFav ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur-md text-rose-500'} rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all`}
                                                >
                                                    <span className="material-icons-outlined text-xl">{isFav ? 'favorite' : 'favorite_border'}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                                                <span className="material-icons-outlined text-sm">location_on</span>
                                                <span className="truncate">{event.address || 'Adresse non renseignée'}</span>
                                            </div>
                                            <h3 className="text-base font-bold text-[#1a2f28] mb-2 group-hover:text-[#33a17b] transition-colors leading-snug">
                                                {event.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                                {event.description || 'Aucune description disponible.'}
                                            </p>

                                            {/* Matières */}
                                            <div className="flex items-center mt-auto pt-4 border-t border-slate-100">
                                                <div className="flex gap-2 flex-wrap">
                                                    {materials.length > 0 ? (
                                                        materials.map((mat: string) => {
                                                            const vis = MATERIAL_VISUALS[mat] || { icon: 'help', bg: 'bg-gray-50', text: 'text-gray-600' };
                                                            return (
                                                                <div key={mat} className={`flex items-center gap-1 px-2.5 py-1 ${vis.bg} ${vis.text} rounded-lg text-[11px] font-bold`}>
                                                                    <span className="material-icons-outlined text-xs">{vis.icon}</span>
                                                                    {mat}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Aucune matière</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2.5 mt-4">
                                                <button
                                                    onClick={() => handleParticipate(event.id)}
                                                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isParticipating
                                                        ? 'bg-[#33a17b] text-white shadow-md'
                                                        : 'bg-[#1a2f28] text-white hover:bg-[#2a453c] shadow-sm'
                                                        }`}
                                                >
                                                    <span className="material-icons-outlined text-base">{isParticipating ? 'check_circle' : 'group_add'}</span>
                                                    {isParticipating ? 'Inscrit !' : 'Participer'}
                                                    {pCount > 0 && (
                                                        <span className="ml-0.5 px-2 py-0.5 bg-white/20 rounded-full text-[11px]">{pCount}</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleComments(event.id)}
                                                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isCommentsOpen ? 'bg-[#1a2f28] text-white' : 'bg-slate-100 text-[#1a2f28] hover:bg-slate-200'
                                                        }`}
                                                >
                                                    <span className="material-icons-outlined text-base">chat_bubble_outline</span>
                                                    {spotComments.length > 0 ? spotComments.length : ''}
                                                </button>
                                            </div>

                                            {/* Commentaires */}
                                            {isCommentsOpen && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                                    {spotComments.length === 0 && (
                                                        <p className="text-xs text-slate-400 text-center italic py-3">Aucun commentaire pour le moment</p>
                                                    )}
                                                    {spotComments.map((c: any) => (
                                                        <div key={c.id} className="flex gap-3">
                                                            <div className="w-8 h-8 bg-[#1a2f28] rounded-full flex items-center justify-center flex-shrink-0">
                                                                <span className="text-white text-xs font-bold">{c.author?.[0]?.toUpperCase()}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-[#1a2f28]">
                                                                    {c.author}
                                                                    <span className="font-normal text-slate-400 ml-2">
                                                                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                                                                    </span>
                                                                </p>
                                                                <p className="text-sm text-slate-500 mt-0.5">{c.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex gap-2 pt-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Votre nom"
                                                            value={commentAuthor}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setCommentAuthor(val);
                                                                setUserName(val || 'Utilisateur');
                                                                localStorage.setItem('cleanspot_username', val);
                                                            }}
                                                            className="w-28 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Écrire un commentaire..."
                                                            value={commentInput}
                                                            onChange={(e) => setCommentInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(event.id)}
                                                            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#33a17b]/30"
                                                        />
                                                        <button
                                                            onClick={() => handleAddComment(event.id)}
                                                            disabled={!commentInput.trim() || !commentAuthor.trim()}
                                                            className="px-4 py-2.5 bg-[#1a2f28] text-white rounded-xl text-xs font-bold hover:bg-[#2a453c] transition-all disabled:opacity-40"
                                                        >
                                                            <span className="material-icons-outlined text-base">send</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* État vide avec filtre */}
                    {!loading && filteredEvents.length === 0 && hasActiveFilters && (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <span className="material-icons-outlined text-5xl text-slate-300">search_off</span>
                            </div>
                            <h3 className="text-xl font-black text-[#1a2f28] mb-2">Aucun événement trouvé</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mb-8">
                                Nous n'avons rien trouvé correspondant à vos critères. Essayez d'élargir votre recherche.
                            </p>
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 px-8 py-3.5 bg-[#1a2f28] text-white text-sm font-bold rounded-2xl hover:bg-[#2a453c] shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <span className="material-icons-outlined text-lg">restart_alt</span>
                                Tout réinitialiser
                            </button>
                        </div>
                    )}

                    {/* État vide sans filtre */}
                    {!loading && filteredEvents.length === 0 && !hasActiveFilters && (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                <span className="material-icons-outlined text-5xl text-emerald-200">park</span>
                            </div>
                            <h3 className="text-xl font-black text-[#1a2f28] mb-2">C'est tout propre ici !</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mb-8">
                                Aucun événement n'est prévu pour le moment. Soyez le premier à organiser une collecte !
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-8 py-3.5 bg-[#33a17b] text-white text-sm font-bold rounded-2xl hover:bg-[#288a68] shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <span className="material-icons-outlined text-lg">add</span>
                                Créer un événement
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* FAB */}
            <div className="fixed bottom-8 right-8 z-30">
                <button
                    onClick={() => setShowForm(true)}
                    className="group w-16 h-16 bg-[#1a2f28] hover:bg-[#2a453c] text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_10px_40px_rgba(26,47,40,0.4)]"
                >
                    <span className="material-icons-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
                </button>
            </div>

            <SpotFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreateSpot}
                mode="create"
                initialData={undefined}
                pickedPosition={null}
            />
        </div>
    );
}
