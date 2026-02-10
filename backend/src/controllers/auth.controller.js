const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email dan password harus diisi'
                }
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { class: true }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Email atau password salah'
                }
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Email atau password salah'
                }
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    nis: user.nis,
                    role: user.role,
                    class: user.class ? {
                        id: user.class.id,
                        name: user.class.name,
                        geofenceLat: user.class.geofenceLat ? parseFloat(user.class.geofenceLat) : null,
                        geofenceLng: user.class.geofenceLng ? parseFloat(user.class.geofenceLng) : null,
                        geofenceRadius: user.class.geofenceRadius
                    } : null
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan server'
            }
        });
    }
};

// Get current user info
const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { class: true }
        });

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                nis: user.nis,
                role: user.role,
                class: user.class ? {
                    id: user.class.id,
                    name: user.class.name,
                    geofenceLat: user.class.geofenceLat ? parseFloat(user.class.geofenceLat) : null,
                    geofenceLng: user.class.geofenceLng ? parseFloat(user.class.geofenceLng) : null,
                    geofenceRadius: user.class.geofenceRadius
                } : null
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Terjadi kesalahan server'
            }
        });
    }
};

module.exports = { login, me };
