'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, isInsideGeofence } from '@/hooks/useLocation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Navbar } from '@/components/layout/Navbar';
import { attendanceApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/components/maps/LocationMap'), { ssr: false });

export default function StudentDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const { latitude, longitude, accuracy, error: locationError, isLoading: locationLoading } = useLocation({
        enableLiveTracking: true
    });
    const isOnline = useOnlineStatus();
    const router = useRouter();

    const [todayAttendance, setTodayAttendance] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'STUDENT')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchTodayAttendance();
        }
    }, [user]);

    // Calculate geofence status
    const geofenceStatus = useMemo(() => {
        if (!latitude || !longitude || !user?.class?.geofenceLat || !user?.class?.geofenceLng) {
            return null;
        }
        return isInsideGeofence(
            latitude,
            longitude,
            user.class.geofenceLat,
            user.class.geofenceLng,
            user.class.geofenceRadius || 100
        );
    }, [latitude, longitude, user?.class]);

    const fetchTodayAttendance = async () => {
        try {
            const response = await attendanceApi.getToday();
            setTodayAttendance(response.data.data);
        } catch (error) {
            console.error('Error fetching today attendance:', error);
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    const handleCheckIn = async () => {
        if (!latitude || !longitude) {
            setMessage({ type: 'error', text: 'Menunggu lokasi GPS...' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await attendanceApi.checkIn(latitude, longitude, accuracy || undefined);
            setTodayAttendance(response.data.data);
            setMessage({ type: 'success', text: response.data.message });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Gagal melakukan check-in',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckOut = async () => {
        if (!latitude || !longitude) {
            setMessage({ type: 'error', text: 'Menunggu lokasi GPS...' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await attendanceApi.checkOut(latitude, longitude, accuracy || undefined);
            setTodayAttendance(response.data.data);
            setMessage({ type: 'success', text: response.data.message });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Gagal melakukan check-out',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const hasCheckedIn = todayAttendance?.checkInTime;
    const hasCheckedOut = todayAttendance?.checkOutTime;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {user.name} 👋</h1>
                    <p className="text-gray-600 mt-1">
                        {user.class ? `Kelas: ${user.class.name}` : 'Tidak ada kelas'}
                    </p>
                </div>

                {/* Live Location & Geofence Status Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">📍 Lokasi Anda</h2>
                        {locationLoading && (
                            <div className="flex items-center text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                <span className="text-sm">Mencari lokasi...</span>
                            </div>
                        )}
                        {!locationLoading && latitude && longitude && (
                            <div className="flex items-center text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                <span className="text-sm">Live</span>
                            </div>
                        )}
                    </div>

                    {locationError && (
                        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
                            <div className="flex items-center">
                                <span className="text-xl mr-2">⚠️</span>
                                <div>
                                    <p className="font-medium">Gagal mendapatkan lokasi</p>
                                    <p className="text-sm">{locationError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {latitude && longitude && (
                        <>
                            {/* Map with live location */}
                            <div className="relative rounded-xl overflow-hidden mb-4">
                                <LocationMap
                                    latitude={latitude}
                                    longitude={longitude}
                                    geofenceCenter={user.class?.geofenceLat && user.class?.geofenceLng ? {
                                        lat: user.class.geofenceLat,
                                        lng: user.class.geofenceLng,
                                    } : undefined}
                                    geofenceRadius={user.class?.geofenceRadius}
                                    className="h-64 w-full"
                                />

                                {/* Live indicator overlay */}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    <span className="text-sm font-medium text-gray-700">Live tracking</span>
                                </div>
                            </div>

                            {/* Geofence Status */}
                            {geofenceStatus ? (
                                <div className={`p-4 rounded-xl ${geofenceStatus.isInside
                                    ? 'bg-green-50 border-2 border-green-200'
                                    : 'bg-yellow-50 border-2 border-yellow-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-3xl mr-3">
                                                {geofenceStatus.isInside ? '✅' : '📍'}
                                            </span>
                                            <div>
                                                <p className={`font-semibold ${geofenceStatus.isInside
                                                    ? 'text-green-800'
                                                    : 'text-yellow-800'}`}>
                                                    {geofenceStatus.isInside
                                                        ? 'Anda berada di dalam area kelas'
                                                        : 'Anda berada di luar area kelas'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Jarak dari titik pusat: {geofenceStatus.distance} meter
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-right ${geofenceStatus.isInside
                                            ? 'text-green-600'
                                            : 'text-yellow-600'}`}>
                                            <span className="text-2xl font-bold">{geofenceStatus.distance}m</span>
                                            <p className="text-xs">dari pusat</p>
                                        </div>
                                    </div>
                                </div>
                            ) : user.class ? (
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <p className="text-gray-600 text-center">
                                        Menunggu data geofence kelas...
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                                    <p className="text-yellow-800 text-center">
                                        ⚠️ Anda belum terdaftar di kelas manapun
                                    </p>
                                </div>
                            )}

                            {/* Location details */}
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                <span>📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                                {accuracy && <span>Akurasi: ±{accuracy.toFixed(0)}m</span>}
                            </div>
                        </>
                    )}

                    {!latitude && !longitude && !locationError && locationLoading && (
                        <div className="h-64 flex flex-col items-center justify-center bg-gray-100 rounded-xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600">Mengambil lokasi GPS Anda...</p>
                            <p className="text-sm text-gray-500 mt-1">Pastikan izin lokasi diaktifkan</p>
                        </div>
                    )}
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Hari Ini</h2>

                    {isLoadingAttendance ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-xl ${hasCheckedIn ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="text-2xl mb-2">{hasCheckedIn ? '✅' : '⏳'}</div>
                                <div className="text-sm text-gray-600">Check-in</div>
                                <div className="font-semibold text-gray-800">
                                    {hasCheckedIn
                                        ? new Date(todayAttendance.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                        : 'Belum absen'}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl ${hasCheckedOut ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="text-2xl mb-2">{hasCheckedOut ? '✅' : '⏳'}</div>
                                <div className="text-sm text-gray-600">Check-out</div>
                                <div className="font-semibold text-gray-800">
                                    {hasCheckedOut
                                        ? new Date(todayAttendance.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                        : 'Belum pulang'}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl ${hasCheckedOut ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="text-2xl mb-2">⏱️</div>
                                <div className="text-sm text-gray-600">Durasi</div>
                                <div className="font-semibold text-gray-800">
                                    {todayAttendance?.durationFormatted || '-'}
                                </div>
                            </div>
                        </div>
                    )}

                    {todayAttendance?.checkInStatus && (
                        <div className={`mt-4 p-3 rounded-lg ${todayAttendance.checkInStatus === 'INSIDE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {todayAttendance.checkInStatus === 'INSIDE'
                                ? '📍 Check-in di dalam area kelas'
                                : '⚠️ Check-in di luar area kelas'}
                        </div>
                    )}
                </div>

                {/* Action Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Absensi</h2>

                    {message && (
                        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    {!isOnline && (
                        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
                            ⚠️ Anda sedang offline. Harap sambungkan ke internet untuk melakukan absensi.
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        {!hasCheckedIn && (
                            <button
                                onClick={handleCheckIn}
                                disabled={isSubmitting || !isOnline || !latitude || !longitude}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                            >
                                {!latitude || !longitude ? (
                                    <span className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Menunggu GPS...
                                    </span>
                                ) : isSubmitting ? 'Memproses...' : '📍 Absen Masuk'}
                            </button>
                        )}

                        {hasCheckedIn && !hasCheckedOut && (
                            <button
                                onClick={handleCheckOut}
                                disabled={isSubmitting || !isOnline || !latitude || !longitude}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                            >
                                {!latitude || !longitude ? (
                                    <span className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Menunggu GPS...
                                    </span>
                                ) : isSubmitting ? 'Memproses...' : '👋 Absen Pulang'}
                            </button>
                        )}

                        {hasCheckedOut && (
                            <div className="flex-1 bg-gray-100 text-gray-600 py-4 px-6 rounded-xl font-semibold text-lg text-center">
                                ✅ Absensi hari ini selesai
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
