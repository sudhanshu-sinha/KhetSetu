const express = require('express');
const router = express.Router();
const { getOrCreateChat, sendMessage, getMyChats, getChatMessages, markAsRead } = require('../controllers/chatController');
const { createRating, getUserRatings, createPayment, getPayments, updatePaymentStatus } = require('../controllers/ratingPaymentController');
const { auth } = require('../middleware/auth');

// Chat routes
router.post('/start', auth, getOrCreateChat);
router.get('/', auth, getMyChats);
router.get('/:chatId/messages', auth, getChatMessages);
router.post('/:chatId/message', auth, sendMessage);
router.put('/:chatId/read', auth, markAsRead);

module.exports = router;
