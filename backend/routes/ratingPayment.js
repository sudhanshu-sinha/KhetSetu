const express = require('express');
const router = express.Router();
const { createRating, getUserRatings, createPayment, getPayments, updatePaymentStatus } = require('../controllers/ratingPaymentController');
const { auth } = require('../middleware/auth');
const { ratingRules, validate } = require('../middleware/validate');

// Rating routes
router.post('/ratings', auth, ratingRules, validate, createRating);
router.get('/ratings/user/:userId', auth, getUserRatings);

// Payment routes
router.post('/payments', auth, createPayment);
router.get('/payments', auth, getPayments);
router.put('/payments/:id/status', auth, updatePaymentStatus);

module.exports = router;
