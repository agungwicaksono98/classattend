'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function Navbar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-4">
                        <Link href={`/${user.role.toLowerCase()}`} className="font-bold text-xl">
                            📍 ClassAttend
                        </Link>
                        {user.role === 'STUDENT' && (
                            <>
                                <Link href="/student" className="hover:bg-white/10 px-3 py-2 rounded-md transition">
                                    Dashboard
                                </Link>
                                <Link href="/student/history" className="hover:bg-white/10 px-3 py-2 rounded-md transition">
                                    Riwayat
                                </Link>
                            </>
                        )}
                        {user.role === 'TEACHER' && (
                            <>
                                <Link href="/teacher" className="hover:bg-white/10 px-3 py-2 rounded-md transition">
                                    Dashboard
                                </Link>
                            </>
                        )}
                        {user.role === 'ADMIN' && (
                            <>
                                <Link href="/admin" className="hover:bg-white/10 px-3 py-2 rounded-md transition">
                                    Dashboard
                                </Link>
                                <Link href="/admin/users" className="hover:bg-white/10 px-3 py-2 rounded-md transition">
                                    Users
                                </Link>
                                <Link href="/admin/classes" className="hover:bg-white/10 px-3 py-2 rounded-md transition">
                                    Kelas
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">
                            <span className="opacity-75">Halo,</span>{' '}
                            <span className="font-medium">{user.name}</span>
                            <span className="ml-2 px-2 py-1 bg-white/20 rounded text-xs">
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
