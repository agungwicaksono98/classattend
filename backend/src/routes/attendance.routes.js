const express = require('express');
const { checkIn, checkOut, getToday, getHistory } = require('../controllers/attendance.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/attendance/check-in
router.post('/check-in', authorize('STUDENT'), checkIn);

// POST /api/attendance/check-out
router.post('/check-out', authorize('STUDENT'), checkOut);

// GET /api/attendance/today
router.get('/today', getToday);

// GET /api/attendance/history
router.get('/history', getHistory);

module.exports = router;
