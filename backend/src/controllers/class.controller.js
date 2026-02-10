const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { formatDuration, getTodayDate } = require('../utils/geofence');

// Get all classes
const getAllClasses = async (req, res) => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                teacher: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            data: classes.map(cls => ({
                id: cls.id,
                name: cls.name,
                teacher: cls.teacher,
                studentCount: cls._count.students,
                geofenceLat: cls.geofenceLat ? parseFloat(cls.geofenceLat) : null,
                geofenceLng: cls.geofenceLng ? parseFloat(cls.geofenceLng) : null,
                geofenceRadius: cls.geofenceRadius
            }))
        });
    } catch (error) {
        console.error('Get all classes error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

// Get class attendance for a specific date
const getClassAttendance = async (req, res) => {
    try {
        const { classId } = req.params;
        const { date = getTodayDate() } = req.query;

        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                students: {
                    select: {
                        id: true,
                        name: true,
                        nis: true,
                        attendances: {
                            where: { date: new Date(date) }
                        }
                    }
                }
            }
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Kelas tidak ditemukan' }
            });
        }

        const students = classData.students.map(student => {
            const attendance = student.attendances[0];
            let status = 'ABSENT';
            if (attendance) {
                status = attendance.checkOutTime ? 'CHECKED_OUT' : 'CHECKED_IN';
            }

            return {
                id: student.id,
                name: student.name,
                nis: student.nis,
                status,
                checkInTime: attendance?.checkInTime || null,
                checkOutTime: attendance?.checkOutTime || null,
                checkInLat: attendance?.checkInLat ? parseFloat(attendance.checkInLat) : null,
                checkInLng: attendance?.checkInLng ? parseFloat(attendance.checkInLng) : null,
                checkInStatus: attendance?.checkInStatus || null,
                durationMinutes: attendance?.durationMinutes || null,
                durationFormatted: attendance?.durationMinutes ? formatDuration(attendance.durationMinutes) : null
            };
        });

        const present = students.filter(s => s.status !== 'ABSENT').length;
        const insideGeofence = students.filter(s => s.checkInStatus === 'INSIDE').length;
        const outsideGeofence = students.filter(s => s.checkInStatus === 'OUTSIDE').length;

        res.json({
            success: true,
            data: {
                class: {
                    id: classData.id,
                    name: classData.name,
                    geofenceLat: classData.geofenceLat ? parseFloat(classData.geofenceLat) : null,
                    geofenceLng: classData.geofenceLng ? parseFloat(classData.geofenceLng) : null,
                    geofenceRadius: classData.geofenceRadius
                },
                date,
                summary: {
                    total: students.length,
                    present,
                    absent: students.length - present,
                    insideGeofence,
                    outsideGeofence
                },
                students
            }
        });
    } catch (error) {
        console.error('Get class attendance error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

// Update class geofence (Admin only)
const updateGeofence = async (req, res) => {
    try {
        const { classId } = req.params;
        const { geofenceLat, geofenceLng, geofenceRadius } = req.body;

        const updatedClass = await prisma.class.update({
            where: { id: classId },
            data: {
                geofenceLat,
                geofenceLng,
                geofenceRadius
            }
        });

        res.json({
            success: true,
            data: {
                id: updatedClass.id,
                name: updatedClass.name,
                geofenceLat: updatedClass.geofenceLat ? parseFloat(updatedClass.geofenceLat) : null,
                geofenceLng: updatedClass.geofenceLng ? parseFloat(updatedClass.geofenceLng) : null,
                geofenceRadius: updatedClass.geofenceRadius
            },
            message: 'Geofence berhasil diperbarui'
        });
    } catch (error) {
        console.error('Update geofence error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

// Create class (Admin only)
const createClass = async (req, res) => {
    try {
        const { name, teacherId, geofenceLat, geofenceLng, geofenceRadius } = req.body;

        const newClass = await prisma.class.create({
            data: {
                name,
                teacherId,
                geofenceLat,
                geofenceLng,
                geofenceRadius: geofenceRadius || 100
            },
            include: {
                teacher: { select: { id: true, name: true } }
            }
        });

        res.status(201).json({
            success: true,
            data: {
                id: newClass.id,
                name: newClass.name,
                teacher: newClass.teacher,
                geofenceLat: newClass.geofenceLat ? parseFloat(newClass.geofenceLat) : null,
                geofenceLng: newClass.geofenceLng ? parseFloat(newClass.geofenceLng) : null,
                geofenceRadius: newClass.geofenceRadius
            },
            message: 'Kelas berhasil dibuat'
        });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

module.exports = { getAllClasses, getClassAttendance, updateGeofence, createClass };
