const express = require('express');
const { login, me } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (Protected)
router.get('/me', authMiddleware, me);

module.exports = router;
