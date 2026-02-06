const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Item = require('../models/Item');

router.get('/', protect, async (req, res) => {
  const items = await Item.find().sort('name');
  res.json(items);
});

router.post('/', protect, async (req, res) => {
  const { name, unit } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });

  if (await Item.findOne({ name })) return res.status(400).json({ message: 'Item exists' });

  const item = await Item.create({ name, unit });
  res.json(item);
});

module.exports = router;
