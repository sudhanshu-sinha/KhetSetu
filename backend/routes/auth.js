const express = require('express');
const router = express.Router();
const { sendOtpHandler, verifyOtpHandler, refreshTokenHandler, updateProfile, getMe, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { otpLimiter, authLimiter } = require('../middleware/rateLimit');
const { phoneRules, otpRules, profileRules, validate } = require('../middleware/validate');

// Public routes
router.post('/send-otp', authLimiter, otpLimiter, phoneRules, validate, sendOtpHandler);
router.post('/verify-otp', authLimiter, otpRules, validate, verifyOtpHandler);
router.post('/refresh-token', authLimiter, refreshTokenHandler);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, profileRules, validate, updateProfile);
router.post('/logout', auth, logout);

module.exports = router;
