const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Expense = require('../models/Expense');

router.get('/', protect, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.post('/', protect, async (req, res) => { // add member
  const { email, password, name, photo } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

  if (await User.findOne({ email })) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, name, photo });
  res.json(user);
});

router.put('/:id', protect, async (req, res) => {
  const { name, photo, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });

  if (req.user._id.toString() !== req.params.id && !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });

  if (name) user.name = name;
  if (photo) user.photo = photo;
  if (password) user.password = await bcrypt.hash(password, 10);

  await user.save();
  res.json(user);
});

router.delete('/:id', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (user.isAdmin) return res.status(400).json({ message: 'Cannot delete admin' });

  // Safeguard: only delete if no expenses as payer
  if (await Expense.countDocuments({ payer: req.params.id })) {
    return res.status(400).json({ message: 'User has expenses, settle first' });
  }

  await User.findByIdAndDelete(req.params.id);
  await Expense.deleteMany({ payer: req.params.id });
  res.json({ message: 'Member deleted' });
});

module.exports = router;
