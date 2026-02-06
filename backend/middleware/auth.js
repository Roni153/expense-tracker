const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports.admin = (req, res, next) => {
  if (req.user?.isAdmin) next();
  else res.status(403).json({ message: 'Admin only' });
};
