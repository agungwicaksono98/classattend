'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { classApi, userApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/components/maps/LocationMap'), { ssr: false });

interface ClassData {
    id: string;
    name: string;
    teacher?: { id: string; name: string };
    studentCount: number;
    geofenceLat: number | null;
    geofenceLng: number | null;
    geofenceRadius: number;
}

export default function AdminClassesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [classes, setClasses] = useState<ClassData[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingClass, setEditingClass] = useState<ClassData | null>(null);
    const [geofenceData, setGeofenceData] = useState({ lat: '', lng: '', radius: '100' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [classesRes, teachersRes] = await Promise.all([
                classApi.getAll(),
                userApi.getAll({ role: 'TEACHER', limit: 100 }),
            ]);
            setClasses(classesRes.data.data);
            setTeachers(teachersRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditGeofence = (cls: ClassData) => {
        setEditingClass(cls);
        setGeofenceData({
            lat: cls.geofenceLat?.toString() || '',
            lng: cls.geofenceLng?.toString() || '',
            radius: cls.geofenceRadius.toString(),
        });
    };

    const handleSaveGeofence = async () => {
        if (!editingClass) return;
        try {
            await classApi.updateGeofence(editingClass.id, {
                geofenceLat: parseFloat(geofenceData.lat),
                geofenceLng: parseFloat(geofenceData.lng),
                geofenceRadius: parseInt(geofenceData.radius),
            });
            setMessage({ type: 'success', text: 'Geofence berhasil diperbarui' });
            setEditingClass(null);
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error?.message || 'Gagal menyimpan geofence' });
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeofenceData(prev => ({
                        ...prev,
                        lat: position.coords.latitude.toFixed(8),
                        lng: position.coords.longitude.toFixed(8),
                    }));
                },
                (error) => {
                    setMessage({ type: 'error', text: 'Gagal mendapatkan lokasi: ' + error.message });
                }
            );
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Kelas 🏫</h1>
                    <p className="text-gray-600 mt-1">Atur kelas dan geofence lokasi</p>
                </div>

                {message && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {classes.map((cls) => (
                            <div key={cls.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {cls.teacher?.name || 'Belum ada guru'} • {cls.studentCount} siswa
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleEditGeofence(cls)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Edit Geofence
                                    </button>
                                </div>

                                <div className="p-6">
                                    {cls.geofenceLat && cls.geofenceLng ? (
                                        <>
                                            <LocationMap
                                                latitude={cls.geofenceLat}
                                                longitude={cls.geofenceLng}
                                                geofenceCenter={{ lat: cls.geofenceLat, lng: cls.geofenceLng }}
                                                geofenceRadius={cls.geofenceRadius}
                                                className="h-48 w-full rounded-xl"
                                            />
                                            <div className="mt-4 text-sm text-gray-600">
                                                <p>📍 {cls.geofenceLat.toFixed(6)}, {cls.geofenceLng.toFixed(6)}</p>
                                                <p>📏 Radius: {cls.geofenceRadius} meter</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-48 flex items-center justify-center bg-gray-100 rounded-xl text-gray-500">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📍</div>
                                                <p>Geofence belum diatur</p>
                                                <button
                                                    onClick={() => handleEditGeofence(cls)}
                                                    className="mt-2 text-blue-600 hover:underline text-sm"
                                                >
                                                    Atur sekarang
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Geofence Edit Modal */}
                {editingClass && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Edit Geofence - {editingClass.name}
                            </h2>

                            <div className="space-y-4">
                                {/* Input fields with higher z-index */}
                                <div className="relative z-20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                            <input
                                                type="text"
                                                value={geofenceData.lat}
                                                onChange={(e) => setGeofenceData({ ...geofenceData, lat: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                                                placeholder="-6.200000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                            <input
                                                type="text"
                                                value={geofenceData.lng}
                                                onChange={(e) => setGeofenceData({ ...geofenceData, lng: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                                                placeholder="106.816666"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGetCurrentLocation}
                                        className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition"
                                    >
                                        📍 Gunakan Lokasi Saya Sekarang
                                    </button>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meter)</label>
                                        <input
                                            type="number"
                                            value={geofenceData.radius}
                                            onChange={(e) => setGeofenceData({ ...geofenceData, radius: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>

                                {/* Map preview - lower z-index */}
                                {geofenceData.lat && geofenceData.lng && (
                                    <div className="relative z-10">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preview Lokasi</label>
                                        <div className="rounded-xl overflow-hidden" style={{ isolation: 'isolate' }}>
                                            <LocationMap
                                                latitude={parseFloat(geofenceData.lat)}
                                                longitude={parseFloat(geofenceData.lng)}
                                                geofenceCenter={{ lat: parseFloat(geofenceData.lat), lng: parseFloat(geofenceData.lng) }}
                                                geofenceRadius={parseInt(geofenceData.radius) || 100}
                                                className="h-48 w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons with higher z-index */}
                                <div className="flex gap-4 relative z-20 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingClass(null)}
                                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveGeofence}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
