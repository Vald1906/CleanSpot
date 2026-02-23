"use client";

import { MapContainer, TileLayer, Marker, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, memo } from 'react';

const getVisualsByType = (type: string) => {
    switch (type) {
        case 'Event': return { icon: '🧹', color: 'bg-emerald-500', accent: 'text-emerald-700' };
        case 'Signalement': return { icon: '🚨', color: 'bg-rose-500', accent: 'text-rose-700' };
        case 'Point de Tri': return { icon: '♻️', color: 'bg-slate-500', accent: 'text-slate-700' };
        default: return { icon: '📍', color: 'bg-blue-500', accent: 'text-blue-700' };
    }
};

function RecenterMap({ spot }: { spot: any }) {
    const map = useMap();
    useEffect(() => {
        if (spot?.latitude && spot?.longitude) {
            map.flyTo([spot.latitude, spot.longitude], 16, { animate: true, duration: 1.5 });
        }
    }, [spot?.id, spot?._clickTimestamp, map]);
    return null;
}

function ZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
    useMapEvents({
        zoomend: (e) => onZoomChange(e.target.getZoom()),
    });
    return null;
}

const MapContent = memo(({ onSelectSpot, selectedSpot, dbSpots, zoomLevel, setZoomLevel }: any) => {
    const showMarkers = zoomLevel >= 11;

    const createCustomIcon = (emoji: string, colorClass: string, isActive: boolean) => {
        return L.divIcon({
            html: `
                <div class="group relative flex items-center justify-center">
                    <div class="absolute w-12 h-12 ${colorClass} opacity-20 rounded-full 
                                ${isActive ? 'animate-pulse' : 'animate-ping'}"></div>
                    <div class="flex items-center justify-center w-11 h-11 ${colorClass} text-white 
                                rounded-2xl shadow-lg border-2 border-white transform transition-all duration-300
                                ${isActive ? 'scale-125 rotate-12 ring-4 ring-white/50 shadow-2xl' : 'scale-100'}">
                        <span class="text-xl">${emoji}</span>
                    </div>
                </div>`,
            className: 'custom-marker',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
        });
    };

    return (
        <MapContainer
            center={[48.8566, 2.3522]}
            zoom={13}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            trackResize={true}
        >
            <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                attribution='&copy; Stadia Maps'
            />
            <ZoomControl position="bottomleft" />
            <RecenterMap spot={selectedSpot} />
            <ZoomHandler onZoomChange={setZoomLevel} />

            {showMarkers && dbSpots?.map((spot: any) => {
                const visuals = getVisualsByType(spot.type);
                return (
                    <Marker
                        key={spot.id}
                        position={[spot.latitude, spot.longitude]}
                        icon={createCustomIcon(visuals.icon, visuals.color, selectedSpot?.id === spot.id)}
                        eventHandlers={{
                            click: () => onSelectSpot({ ...spot, ...visuals, _clickTimestamp: Date.now() })
                        }}
                    />
                );
            })}
        </MapContainer>
    );
});

MapContent.displayName = "MapContent";

export default function MapComponent(props: any) {
    const [zoomLevel, setZoomLevel] = useState(13);
    return <MapContent {...props} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />;
}