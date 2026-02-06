const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { email, password, name, photo } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

  try {
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User exists' });

    const isFirst = (await User.countDocuments()) === 0;
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashed, name, photo, isAdmin: isFirst });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: { id: user._id, email, name, photo, isAdmin: isFirst } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.json({ token, user: { id: user._id, email: user.email, name: user.name, photo: user.photo, isAdmin: user.isAdmin } });
});

router.get('/me', protect, (req, res) => {
  res.json({ user: { id: req.user._id, email: req.user.email, name: req.user.name, photo: req.user.photo, isAdmin: req.user.isAdmin } });
});

module.exports = router;
