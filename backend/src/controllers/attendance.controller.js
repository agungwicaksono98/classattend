const prisma = require('../config/db');
const { checkGeofence, formatDuration, getTodayDate } = require('../utils/geofence');

// Check-in
const checkIn = async (req, res) => {
    try {
        const { latitude, longitude, accuracy } = req.body;
        const userId = req.user.id;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Lokasi (latitude dan longitude) harus disertakan'
                }
            });
        }

        // Check if already checked in today
        const today = getTodayDate();
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: new Date(today)
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_EXISTS',
                    message: 'Anda sudah melakukan check-in hari ini'
                }
            });
        }

        // Get user's class for geofence check
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { class: true }
        });

        let checkInStatus = 'OUTSIDE';
        let distanceFromCenter = null;

        if (user.class && user.class.geofenceLat && user.class.geofenceLng) {
            const geofenceResult = checkGeofence(
                latitude,
                longitude,
                parseFloat(user.class.geofenceLat),
                parseFloat(user.class.geofenceLng),
                user.class.geofenceRadius
            );
            checkInStatus = geofenceResult.isInside ? 'INSIDE' : 'OUTSIDE';
            distanceFromCenter = geofenceResult.distance;
        }

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: new Date(today),
                checkInTime: new Date(),
                checkInLat: latitude,
                checkInLng: longitude,
                checkInAccuracy: accuracy || null,
                checkInStatus
            }
        });

        res.status(201).json({
            success: true,
            data: {
                id: attendance.id,
                date: today,
                checkInTime: attendance.checkInTime,
                checkInLat: parseFloat(attendance.checkInLat),
                checkInLng: parseFloat(attendance.checkInLng),
                checkInAccuracy: attendance.checkInAccuracy ? parseFloat(attendance.checkInAccuracy) : null,
                checkInStatus,
                distanceFromCenter
            },
            message: checkInStatus === 'INSIDE'
                ? 'Check-in berhasil! Anda berada di dalam area kelas.'
                : 'Check-in berhasil! Anda berada di luar area kelas.'
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan server'
            }
        });
    }
};

// Check-out
const checkOut = async (req, res) => {
    try {
        const { latitude, longitude, accuracy } = req.body;
        const userId = req.user.id;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Lokasi (latitude dan longitude) harus disertakan'
                }
            });
        }

        // Find today's attendance
        const today = getTodayDate();
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: new Date(today)
            }
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Anda belum melakukan check-in hari ini'
                }
            });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_EXISTS',
                    message: 'Anda sudah melakukan check-out hari ini'
                }
            });
        }

        const checkOutTime = new Date();
        const durationMinutes = Math.round(
            (checkOutTime - new Date(attendance.checkInTime)) / 60000
        );

        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOutTime,
                checkOutLat: latitude,
                checkOutLng: longitude,
                checkOutAccuracy: accuracy || null,
                durationMinutes
            }
        });

        res.json({
            success: true,
            data: {
                id: updatedAttendance.id,
                date: today,
                checkInTime: updatedAttendance.checkInTime,
                checkOutTime: updatedAttendance.checkOutTime,
                checkOutLat: parseFloat(updatedAttendance.checkOutLat),
                checkOutLng: parseFloat(updatedAttendance.checkOutLng),
                checkOutAccuracy: updatedAttendance.checkOutAccuracy ? parseFloat(updatedAttendance.checkOutAccuracy) : null,
                durationMinutes,
                durationFormatted: formatDuration(durationMinutes)
            },
            message: `Check-out berhasil! Durasi kehadiran: ${formatDuration(durationMinutes)}`
        });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan server'
            }
        });
    }
};

// Get today's attendance for current user
const getToday = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getTodayDate();

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: new Date(today)
            }
        });

        if (!attendance) {
            return res.json({
                success: true,
                data: null,
                message: 'Belum ada absensi hari ini'
            });
        }

        let status = 'NOT_CHECKED_IN';
        if (attendance.checkInTime && !attendance.checkOutTime) {
            status = 'CHECKED_IN';
        } else if (attendance.checkOutTime) {
            status = 'CHECKED_OUT';
        }

        res.json({
            success: true,
            data: {
                id: attendance.id,
                date: today,
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                checkInStatus: attendance.checkInStatus,
                durationMinutes: attendance.durationMinutes,
                durationFormatted: attendance.durationMinutes ? formatDuration(attendance.durationMinutes) : null,
                status
            }
        });
    } catch (error) {
        console.error('Get today error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan server'
            }
        });
    }
};

// Get attendance history
const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        const where = { userId };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const [attendances, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.attendance.count({ where })
        ]);

        res.json({
            success: true,
            data: attendances.map(att => ({
                id: att.id,
                date: att.date.toISOString().split('T')[0],
                checkInTime: att.checkInTime,
                checkOutTime: att.checkOutTime,
                checkInStatus: att.checkInStatus,
                durationMinutes: att.durationMinutes,
                durationFormatted: att.durationMinutes ? formatDuration(att.durationMinutes) : null
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan server'
            }
        });
    }
};

module.exports = { checkIn, checkOut, getToday, getHistory };
