'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center z-50">
            <span className="font-medium">⚠️ Anda sedang offline.</span>{' '}
            Fitur absensi tidak tersedia tanpa koneksi internet.
        </div>
    );
}
