'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: string | null;
    isLoading: boolean;
}

interface UseLocationOptions {
    enableLiveTracking?: boolean;
}

export function useLocation(options: UseLocationOptions = {}) {
    const { enableLiveTracking = false } = options;
    const watchIdRef = useRef<number | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [location, setLocation] = useState<LocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        isLoading: true,
    });

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                error: 'Geolocation tidak didukung oleh browser Anda',
                isLoading: false,
            }));
            return;
        }

        setLocation(prev => ({ ...prev, isLoading: true }));

        // Use watchPosition for continuous updates (no timeout issue)
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    error: null,
                    isLoading: false,
                });
            },
            (error) => {
                let errorMessage = 'Mencari lokasi...';
                let shouldRetry = true;

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Izin lokasi ditolak. Mohon aktifkan akses lokasi di browser Anda.';
                        shouldRetry = false;
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Mencari sinyal GPS...';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Mencari lokasi GPS...';
                        break;
                }

                // Don't show error if we already have location - just keep using it
                setLocation(prev => {
                    if (prev.latitude && prev.longitude) {
                        return prev; // Keep existing location
                    }
                    return {
                        ...prev,
                        error: shouldRetry ? null : errorMessage,
                        isLoading: shouldRetry,
                    };
                });

                // Auto retry if not permission denied
                if (shouldRetry && retryTimeoutRef.current === null) {
                    retryTimeoutRef.current = setTimeout(() => {
                        retryTimeoutRef.current = null;
                        getLocation();
                    }, 2000);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: Infinity, // No timeout - keep trying forever
                maximumAge: 5000,
            }
        );
    }, []);

    // Start watching on mount
    useEffect(() => {
        getLocation();

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (retryTimeoutRef.current !== null) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [getLocation]);

    return { ...location, getLocation };
}

// Helper function to calculate distance using Haversine formula
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Check if point is inside geofence
export function isInsideGeofence(
    lat: number,
    lng: number,
    centerLat: number,
    centerLng: number,
    radius: number
): { isInside: boolean; distance: number } {
    const distance = calculateDistance(lat, lng, centerLat, centerLng);
    return {
        isInside: distance <= radius,
        distance: Math.round(distance),
    };
}
