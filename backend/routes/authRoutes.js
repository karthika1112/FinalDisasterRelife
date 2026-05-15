const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/auth/register  — Public
router.post('/register', register);

// @route POST /api/auth/login     — Public
router.post('/login', login);

// @route GET  /api/auth/me        — Private (protected route example)
router.get('/me', protect, getMe);

// @route PUT  /api/auth/password  — Private
router.put('/password', protect, updatePassword);

module.exports = router;
