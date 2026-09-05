const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'peoplepay360_super_secret_jwt_key_2026_hackathon');
    req.user = await User.findById(decoded.id).populate('employee');

    if (!req.user || req.user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'User account inactive or not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token verification failed', error: error.message });
  }
};

module.exports = { protect };
