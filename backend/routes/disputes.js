const express = require('express');
const router = express.Router();
const { createDispute } = require('../controllers/disputeController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createDispute);

module.exports = router;
