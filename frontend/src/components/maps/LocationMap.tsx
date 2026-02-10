'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';

// Create large red pin marker using SVG
const createRedPinIcon = () => {
    const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="48" height="72">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <path fill="#DC2626" stroke="#991B1B" stroke-width="1" filter="url(#shadow)"
                d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z"/>
            <circle fill="#FFFFFF" cx="12" cy="12" r="5"/>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        iconSize: [48, 72],
        iconAnchor: [24, 72],
        popupAnchor: [0, -72],
        className: 'custom-pin-marker'
    });
};

// Create blue pin marker for geofence center
const createBluePinIcon = () => {
    const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="36" height="54">
            <defs>
                <filter id="shadow2" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <path fill="#2563EB" stroke="#1D4ED8" stroke-width="1" filter="url(#shadow2)"
                d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z"/>
            <circle fill="#FFFFFF" cx="12" cy="12" r="5"/>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        iconSize: [36, 54],
        iconAnchor: [18, 54],
        popupAnchor: [0, -54],
        className: 'custom-pin-marker'
    });
};

interface LocationMapProps {
    latitude: number;
    longitude: number;
    geofenceCenter?: { lat: number; lng: number };
    geofenceRadius?: number;
    zoom?: number;
    className?: string;
}

// Component to update map center when position changes
function MapUpdater({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [map, position]);
    return null;
}

export function LocationMap({
    latitude,
    longitude,
    geofenceCenter,
    geofenceRadius = 100,
    zoom = 17,
    className = 'h-64 w-full rounded-lg',
}: LocationMapProps) {
    const position = useMemo(() => [latitude, longitude] as [number, number], [latitude, longitude]);
    const redPinIcon = useMemo(() => createRedPinIcon(), []);
    const bluePinIcon = useMemo(() => createBluePinIcon(), []);

    return (
        <div className={className}>
            <MapContainer
                center={position}
                zoom={zoom}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater position={position} />

                {/* Geofence area - render first so it's behind markers */}
                {geofenceCenter && (
                    <>
                        {/* Geofence circle */}
                        <Circle
                            center={[geofenceCenter.lat, geofenceCenter.lng]}
                            radius={geofenceRadius}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.2,
                                weight: 3,
                            }}
                        />

                        {/* Geofence center - BLUE pin */}
                        <Marker
                            position={[geofenceCenter.lat, geofenceCenter.lng]}
                            icon={bluePinIcon}
                        >
                            <Popup>
                                <div style={{ textAlign: 'center', padding: '4px' }}>
                                    <strong>🎯 Titik Pusat Kelas</strong>
                                    <br />
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        Radius: {geofenceRadius}m
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    </>
                )}

                {/* Student location - RED pin (render last so it's on top) */}
                <Marker position={position} icon={redPinIcon}>
                    <Popup>
                        <div style={{ textAlign: 'center', padding: '4px' }}>
                            <strong>📍 Lokasi Anda</strong>
                            <br />
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </span>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default LocationMap;
