const express = require('express');
const { getAllClasses, getClassAttendance, updateGeofence, createClass } = require('../controllers/class.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/classes
router.get('/', authorize('TEACHER', 'ADMIN'), getAllClasses);

// POST /api/classes (Admin only)
router.post('/', authorize('ADMIN'), createClass);

// GET /api/classes/:classId/attendance
router.get('/:classId/attendance', authorize('TEACHER', 'ADMIN'), getClassAttendance);

// PUT /api/classes/:classId/geofence (Admin only)
router.put('/:classId/geofence', authorize('ADMIN'), updateGeofence);

module.exports = router;
