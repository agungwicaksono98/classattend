const express = require('express');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(authMiddleware, authorize('ADMIN'));

// GET /api/users
router.get('/', getAllUsers);

// POST /api/users
router.post('/', createUser);

// PUT /api/users/:userId
router.put('/:userId', updateUser);

// DELETE /api/users/:userId
router.delete('/:userId', deleteUser);

module.exports = router;
