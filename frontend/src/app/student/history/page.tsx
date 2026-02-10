'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { attendanceApi } from '@/lib/api';

interface AttendanceRecord {
    id: string;
    date: string;
    checkInTime: string;
    checkOutTime: string | null;
    checkInStatus: 'INSIDE' | 'OUTSIDE';
    durationMinutes: number | null;
    durationFormatted: string | null;
}

export default function StudentHistoryPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'STUDENT')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user, pagination.page]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await attendanceApi.getHistory({ page: pagination.page, limit: 10 });
            setHistory(response.data.data);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.pagination.totalPages,
            }));
        } catch (error) {
            console.error('Error fetching history:', error);
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

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Riwayat Absensi 📅</h1>
                    <p className="text-gray-600 mt-1">Lihat catatan kehadiran Anda</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-gray-500">Belum ada riwayat absensi</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {history.map((record) => (
                                    <div key={record.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-800">
                                                    {new Date(record.date).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Masuk: {new Date(record.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    {record.checkOutTime && (
                                                        <> • Pulang: {new Date(record.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${record.checkInStatus === 'INSIDE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {record.checkInStatus === 'INSIDE' ? '📍 Dalam Area' : '⚠️ Luar Area'}
                                                </div>
                                                {record.durationFormatted && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        ⏱️ {record.durationFormatted}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sebelumnya
                                </button>
                                <span className="px-4 py-2 text-gray-600">
                                    Halaman {pagination.page} dari {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
