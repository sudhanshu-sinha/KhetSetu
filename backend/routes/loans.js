const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const { auth } = require('../middleware/auth');

router.get('/my', auth, async (req, res) => {
  const loans = await Loan.find({ farmer: req.userId });
  res.json({ success: true, loans });
});

router.post('/', auth, async (req, res) => {
  const loan = new Loan({ ...req.body, farmer: req.userId });
  await loan.save();
  res.json({ success: true, loan });
});

module.exports = router;
