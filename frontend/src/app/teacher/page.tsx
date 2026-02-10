'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { classApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/components/maps/LocationMap'), { ssr: false });

interface Student {
    id: string;
    name: string;
    nis: string;
    status: 'ABSENT' | 'CHECKED_IN' | 'CHECKED_OUT';
    checkInTime: string | null;
    checkOutTime: string | null;
    checkInLat: number | null;
    checkInLng: number | null;
    checkInStatus: 'INSIDE' | 'OUTSIDE' | null;
    durationFormatted: string | null;
}

interface ClassData {
    class: {
        id: string;
        name: string;
        geofenceLat: number | null;
        geofenceLng: number | null;
        geofenceRadius: number;
    };
    date: string;
    summary: {
        total: number;
        present: number;
        absent: number;
        insideGeofence: number;
        outsideGeofence: number;
    };
    students: Student[];
}

export default function TeacherDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchClasses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClassId) {
            fetchClassAttendance();
        }
    }, [selectedClassId, date]);

    const fetchClasses = async () => {
        try {
            const response = await classApi.getAll();
            setClasses(response.data.data);
            if (response.data.data.length > 0) {
                setSelectedClassId(response.data.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClassAttendance = async () => {
        if (!selectedClassId) return;
        setIsLoading(true);
        try {
            const response = await classApi.getAttendance(selectedClassId, date);
            setClassData(response.data.data);
        } catch (error) {
            console.error('Error fetching class attendance:', error);
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
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Dashboard Guru 📊</h1>
                        <p className="text-gray-600 mt-1">Pantau kehadiran siswa</p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={selectedClassId || ''}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : classData ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            <div className="bg-white rounded-xl shadow p-4">
                                <div className="text-3xl font-bold text-gray-800">{classData.summary.total}</div>
                                <div className="text-sm text-gray-600">Total Siswa</div>
                            </div>
                            <div className="bg-green-50 rounded-xl shadow p-4 border border-green-200">
                                <div className="text-3xl font-bold text-green-600">{classData.summary.present}</div>
                                <div className="text-sm text-gray-600">Hadir</div>
                            </div>
                            <div className="bg-red-50 rounded-xl shadow p-4 border border-red-200">
                                <div className="text-3xl font-bold text-red-600">{classData.summary.absent}</div>
                                <div className="text-sm text-gray-600">Tidak Hadir</div>
                            </div>
                            <div className="bg-blue-50 rounded-xl shadow p-4 border border-blue-200">
                                <div className="text-3xl font-bold text-blue-600">{classData.summary.insideGeofence}</div>
                                <div className="text-sm text-gray-600">Di Dalam Area</div>
                            </div>
                            <div className="bg-yellow-50 rounded-xl shadow p-4 border border-yellow-200">
                                <div className="text-3xl font-bold text-yellow-600">{classData.summary.outsideGeofence}</div>
                                <div className="text-sm text-gray-600">Di Luar Area</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Student List */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-800">Daftar Siswa</h2>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                    {classData.students.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition ${selectedStudent?.id === student.id ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-800">{student.name}</div>
                                                    <div className="text-sm text-gray-500">{student.nis}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {student.checkInStatus && (
                                                        <span className={`px-2 py-1 rounded text-xs ${student.checkInStatus === 'INSIDE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {student.checkInStatus === 'INSIDE' ? '📍 Dalam' : '⚠️ Luar'}
                                                        </span>
                                                    )}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'CHECKED_OUT' ? 'bg-green-100 text-green-700' :
                                                            student.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {student.status === 'CHECKED_OUT' ? 'Selesai' :
                                                            student.status === 'CHECKED_IN' ? 'Hadir' : 'Belum'}
                                                    </span>
                                                </div>
                                            </div>
                                            {student.checkInTime && (
                                                <div className="mt-2 text-sm text-gray-500">
                                                    Masuk: {new Date(student.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    {student.checkOutTime && (
                                                        <> • Pulang: {new Date(student.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</>
                                                    )}
                                                    {student.durationFormatted && (
                                                        <> • Durasi: {student.durationFormatted}</>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Map */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Peta Lokasi</h2>
                                {selectedStudent?.checkInLat && selectedStudent?.checkInLng ? (
                                    <>
                                        <LocationMap
                                            latitude={selectedStudent.checkInLat}
                                            longitude={selectedStudent.checkInLng}
                                            geofenceCenter={classData.class.geofenceLat && classData.class.geofenceLng ? {
                                                lat: classData.class.geofenceLat,
                                                lng: classData.class.geofenceLng,
                                            } : undefined}
                                            geofenceRadius={classData.class.geofenceRadius}
                                            className="h-80 w-full rounded-xl"
                                        />
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="font-medium text-gray-800">{selectedStudent.name}</div>
                                            <div className="text-sm text-gray-600">
                                                Koordinat: {selectedStudent.checkInLat.toFixed(6)}, {selectedStudent.checkInLng.toFixed(6)}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-80 flex items-center justify-center bg-gray-100 rounded-xl text-gray-500">
                                        Pilih siswa untuk melihat lokasi
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Tidak ada data untuk ditampilkan
                    </div>
                )}
            </main>
        </div>
    );
}
