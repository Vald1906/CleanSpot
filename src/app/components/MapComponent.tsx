"use client";

import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const CLEAN_SPOT_DATA = [
    {
        id: 1,
        type: 'Event',
        icon: '🧹',
        color: 'bg-emerald-50',
        accent: 'text-emerald-700',
        pos: [48.8584, 2.2945] as [number, number],
        title: "Berges Propres",
        desc: "Opération annuelle de printemps pour redonner vie aux quais de Seine.",
        author: "Asso Eco-Paris",
        date: "2026-03-15", // Date de l'event
        hours: "09:30 - 12:00",
        address: "Quai Branly, 75007 Paris",
        image: "https://images.unsplash.com/photo-1618477461853-cf6ed80fbe5e?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 2,
        type: 'Signalement',
        icon: '🚨',
        color: 'bg-rose-50',
        accent: 'text-rose-700',
        pos: [48.8738, 2.2950] as [number, number],
        title: "Dépôt Avenue Marceau",
        desc: "Gravats et vieux mobiliers encombrant le trottoir depuis lundi.",
        author: "Marc L.",
        date: "2026-02-16", // Date du signalement
        urgency: "Prioritaire",
        address: "45 Avenue Marceau, 75008 Paris",
        image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 3,
        type: 'Point de Tri',
        icon: '♻️',
        color: 'bg-slate-50',
        accent: 'text-slate-700',
        pos: [48.8606, 2.3376] as [number, number],
        title: "Borne Pyramides",
        desc: "Point de collecte haute capacité pour verre et cartons uniquement.",
        author: "Ville de Paris",
        date: "2024-05-10",
        hours: "24h/7j",
        address: "Rue de l'Échelle, 75001 Paris",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400"
    },
];

function RecenterMap({ pos }: { pos: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (pos) {
            map.flyTo(pos, 16, { animate: true, duration: 1.5 });
        }
    }, [pos, map]);
    return null;
}

export default function MapComponent({ onSelectSpot, selectedSpot }: { onSelectSpot: (spot: any) => void, selectedSpot: any }) {

    const createCustomIcon = (emoji: string, colorClass: string, isActive: boolean) => {
        if (typeof window === 'undefined') return undefined;

        return L.divIcon({
            html: `
                <div class="group relative flex items-center justify-center">
                    <div class="absolute w-12 h-12 ${colorClass} opacity-20 rounded-full 
                                animate-ping group-hover:opacity-40 group-hover:scale-150 transition-all duration-500">
                    </div>
                    
                    <div class="flex items-center justify-center w-11 h-11 ${colorClass} text-white 
                                rounded-2xl shadow-lg border-2 border-white
                                transform transition-all duration-300 ease-out
                                ${isActive ? 'scale-125 rotate-12 ring-4 ring-white/50 shadow-2xl' : 'scale-100'}
                                group-hover:scale-115 group-hover:-translate-y-2 group-hover:rotate-3 
                                group-hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2)] group-hover:ring-2 group-hover:ring-white">
                        <span class="text-xl transition-transform duration-300 group-hover:scale-110">${emoji}</span>
                    </div>

                    <div class="absolute -bottom-1 w-2 h-2 ${colorClass} rotate-45 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                </div>`,
            className: 'custom-marker',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
        });
    };

    return (
        <MapContainer center={[48.8566, 2.3522]} zoom={13} zoomControl={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
            />
            <ZoomControl position="bottomleft" />
            <RecenterMap pos={selectedSpot?.pos || null} />

            {CLEAN_SPOT_DATA.map((spot) => (
                <Marker
                    key={spot.id}
                    position={spot.pos}
                    icon={createCustomIcon(spot.icon, spot.color, selectedSpot?.id === spot.id)}
                    eventHandlers={{ click: () => onSelectSpot(spot) }}
                />
            ))}
        </MapContainer>
    );
}