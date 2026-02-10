'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { userApi, classApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    nis: string | null;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    class?: { id: string; name: string };
}

export default function AdminUsersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        email: '', password: '', name: '', nis: '', role: 'STUDENT', classId: ''
    });
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
    }, [user, roleFilter]);

    const fetchData = async () => {
        try {
            const [usersRes, classesRes] = await Promise.all([
                userApi.getAll({ role: roleFilter || undefined, limit: 100 }),
                classApi.getAll(),
            ]);
            setUsers(usersRes.data.data);
            setClasses(classesRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userApi.update(editingUser.id, formData);
                setMessage({ type: 'success', text: 'User berhasil diperbarui' });
            } else {
                await userApi.create(formData as any);
                setMessage({ type: 'success', text: 'User berhasil dibuat' });
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ email: '', password: '', name: '', nis: '', role: 'STUDENT', classId: '' });
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error?.message || 'Gagal menyimpan user' });
        }
    };

    const handleEdit = (u: User) => {
        setEditingUser(u);
        setFormData({
            email: u.email,
            password: '',
            name: u.name,
            nis: u.nis || '',
            role: u.role,
            classId: u.class?.id || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Yakin ingin menghapus user ini?')) return;
        try {
            await userApi.delete(userId);
            setMessage({ type: 'success', text: 'User berhasil dihapus' });
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error?.message || 'Gagal menghapus user' });
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
                        <h1 className="text-3xl font-bold text-gray-800">Kelola Users 👥</h1>
                        <p className="text-gray-600 mt-1">Tambah, edit, atau hapus user</p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="">Semua Role</option>
                            <option value="STUDENT">Siswa</option>
                            <option value="TEACHER">Guru</option>
                            <option value="ADMIN">Admin</option>
                        </select>

                        <button
                            onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', name: '', nis: '', role: 'STUDENT', classId: '' }); setShowModal(true); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            + Tambah User
                        </button>
                    </div>
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
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{u.name}</div>
                                            {u.nis && <div className="text-sm text-gray-500">NIS: {u.nis}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    u.role === 'TEACHER' ? 'bg-green-100 text-green-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{u.class?.name || '-'}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                            <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {editingUser ? 'Edit User' : 'Tambah User'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text" placeholder="Nama" value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg text-gray-900" required
                                />
                                <input
                                    type="email" placeholder="Email" value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg text-gray-900" required
                                />
                                <input
                                    type="password" placeholder={editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                                    required={!editingUser}
                                />
                                <input
                                    type="text" placeholder="NIS (untuk siswa)" value={formData.nis}
                                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                                />
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                                >
                                    <option value="STUDENT">Siswa</option>
                                    <option value="TEACHER">Guru</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                {formData.role === 'STUDENT' && (
                                    <select
                                        value={formData.classId}
                                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg text-gray-900"
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                                        Batal
                                    </button>
                                    <button type="submit"
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
