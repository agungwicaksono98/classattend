const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { role, classId, page = 1, limit = 20 } = req.query;

        const where = {};
        if (role) where.role = role;
        if (classId) where.classId = classId;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    class: { select: { id: true, name: true } }
                },
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            success: true,
            data: users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                nis: user.nis,
                role: user.role,
                class: user.class
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

// Create user (Admin only)
const createUser = async (req, res) => {
    try {
        const { email, password, name, nis, role, classId } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email, password, name, dan role harus diisi'
                }
            });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { code: 'ALREADY_EXISTS', message: 'Email sudah terdaftar' }
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                nis,
                role,
                classId
            },
            include: { class: { select: { id: true, name: true } } }
        });

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                nis: user.nis,
                role: user.role,
                class: user.class
            },
            message: 'User berhasil dibuat'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { email, password, name, nis, role, classId } = req.body;

        const updateData = {};
        if (email) updateData.email = email;
        if (name) updateData.name = name;
        if (nis !== undefined) updateData.nis = nis;
        if (role) updateData.role = role;
        if (classId !== undefined) updateData.classId = classId;
        if (password) updateData.passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { class: { select: { id: true, name: true } } }
        });

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                nis: user.nis,
                role: user.role,
                class: user.class
            },
            message: 'User berhasil diperbarui'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        await prisma.user.delete({ where: { id: userId } });

        res.json({
            success: true,
            message: 'User berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
        });
    }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
