const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const items = await Equipment.find({ available: true }).populate('owner', 'name phone');
  res.json({ success: true, items });
});

router.post('/', auth, async (req, res) => {
  const item = new Equipment({ ...req.body, owner: req.userId });
  await item.save();
  res.json({ success: true, item });
});

module.exports = router;
