import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect if already on the login page
            const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
            if (!isLoginPage) {
                Cookies.remove('token');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
};

// Attendance API
export const attendanceApi = {
    checkIn: (latitude: number, longitude: number, accuracy?: number) =>
        api.post('/attendance/check-in', { latitude, longitude, accuracy }),
    checkOut: (latitude: number, longitude: number, accuracy?: number) =>
        api.post('/attendance/check-out', { latitude, longitude, accuracy }),
    getToday: () => api.get('/attendance/today'),
    getHistory: (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) =>
        api.get('/attendance/history', { params }),
};

// Class API
export const classApi = {
    getAll: () => api.get('/classes'),
    getAttendance: (classId: string, date?: string) =>
        api.get(`/classes/${classId}/attendance`, { params: { date } }),
    updateGeofence: (classId: string, data: { geofenceLat: number; geofenceLng: number; geofenceRadius: number }) =>
        api.put(`/classes/${classId}/geofence`, data),
    create: (data: { name: string; teacherId?: string; geofenceLat?: number; geofenceLng?: number; geofenceRadius?: number }) =>
        api.post('/classes', data),
};

// User API
export const userApi = {
    getAll: (params?: { role?: string; classId?: string; page?: number; limit?: number }) =>
        api.get('/users', { params }),
    create: (data: { email: string; password: string; name: string; nis?: string; role: string; classId?: string }) =>
        api.post('/users', data),
    update: (userId: string, data: Partial<{ email: string; password: string; name: string; nis: string; role: string; classId: string }>) =>
        api.put(`/users/${userId}`, data),
    delete: (userId: string) => api.delete(`/users/${userId}`),
};
