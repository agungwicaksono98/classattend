'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { classApi, userApi } from '@/lib/api';

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        todayAttendance: 0,
    });
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            const [classesRes, studentsRes, teachersRes] = await Promise.all([
                classApi.getAll(),
                userApi.getAll({ role: 'STUDENT', limit: 1 }),
                userApi.getAll({ role: 'TEACHER', limit: 1 }),
            ]);

            setClasses(classesRes.data.data);
            setStats({
                totalStudents: studentsRes.data.pagination.total,
                totalTeachers: teachersRes.data.pagination.total,
                totalClasses: classesRes.data.data.length,
                todayAttendance: 0, // Would need separate endpoint
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
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
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin 🛠️</h1>
                    <p className="text-gray-600 mt-1">Kelola sistem absensi</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                                <div className="text-4xl mb-2">👨‍🎓</div>
                                <div className="text-3xl font-bold">{stats.totalStudents}</div>
                                <div className="text-blue-100">Total Siswa</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                                <div className="text-4xl mb-2">👨‍🏫</div>
                                <div className="text-3xl font-bold">{stats.totalTeachers}</div>
                                <div className="text-green-100">Total Guru</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                                <div className="text-4xl mb-2">🏫</div>
                                <div className="text-3xl font-bold">{stats.totalClasses}</div>
                                <div className="text-purple-100">Total Kelas</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                                <div className="text-4xl mb-2">📍</div>
                                <div className="text-3xl font-bold">2</div>
                                <div className="text-orange-100">Admin</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-left"
                            >
                                <div className="text-3xl mb-4">👥</div>
                                <div className="text-lg font-semibold text-gray-800">Kelola Users</div>
                                <div className="text-gray-600 text-sm mt-1">Tambah, edit, atau hapus siswa dan guru</div>
                            </button>

                            <button
                                onClick={() => router.push('/admin/classes')}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-left"
                            >
                                <div className="text-3xl mb-4">🏫</div>
                                <div className="text-lg font-semibold text-gray-800">Kelola Kelas</div>
                                <div className="text-gray-600 text-sm mt-1">Atur kelas dan geofence lokasi</div>
                            </button>

                            <button
                                onClick={() => router.push('/teacher')}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-left"
                            >
                                <div className="text-3xl mb-4">📊</div>
                                <div className="text-lg font-semibold text-gray-800">Lihat Kehadiran</div>
                                <div className="text-gray-600 text-sm mt-1">Monitor absensi real-time</div>
                            </button>
                        </div>

                        {/* Classes Overview */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Daftar Kelas</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {classes.map((cls) => (
                                    <div key={cls.id} className="px-6 py-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-800">{cls.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {cls.teacher?.name || 'Belum ada guru'} • {cls.studentCount} siswa
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {cls.geofenceLat && cls.geofenceLng ? (
                                                <span className="text-green-600">📍 Geofence aktif ({cls.geofenceRadius}m)</span>
                                            ) : (
                                                <span className="text-yellow-600">⚠️ Belum ada geofence</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
