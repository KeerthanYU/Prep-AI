const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.cookies?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach basic fields
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userPermissions = decoded.permissions || [];

    // Optionally load fresh user profile
    const user = await User.findById(decoded.userId).select('-password -loginHistory');
    if (user) {
      req.user = user;
    }

    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

module.exports = verifyToken;
