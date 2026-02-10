'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    nis?: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    class?: {
        id: string;
        name: string;
        geofenceLat?: number;
        geofenceLng?: number;
        geofenceRadius?: number;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.me();
            setUser(response.data.data);
        } catch {
            Cookies.remove('token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        const { token, user } = response.data.data;

        Cookies.set('token', token, { expires: 7 });
        setUser(user);

        // Redirect based on role
        switch (user.role) {
            case 'STUDENT':
                router.push('/student');
                break;
            case 'TEACHER':
                router.push('/teacher');
                break;
            case 'ADMIN':
                router.push('/admin');
                break;
            default:
                router.push('/');
        }
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
