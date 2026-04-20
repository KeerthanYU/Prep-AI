const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.cookies?.Authorization;

  // --- Missing token ---
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('>>> [AUTH] No token provided in request to', req.originalUrl);
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Debug logging — decoded payload
    console.log('>>> [AUTH] Token verified for userId:', decoded.userId, '| role:', decoded.role);

    // Attach decoded JWT payload to req.user so controllers use req.user.userId
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    // Also keep legacy shortcuts for any other middleware/controllers that may use them
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userPermissions = decoded.permissions || [];

    next();
  } catch (err) {
    // --- Expired token ---
    if (err.name === 'TokenExpiredError') {
      console.warn('>>> [AUTH] Token expired for request to', req.originalUrl);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    // --- Invalid signature / malformed ---
    if (err.name === 'JsonWebTokenError') {
      console.warn('>>> [AUTH] Invalid token for request to', req.originalUrl, ':', err.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token. Please log in again.',
        code: 'TOKEN_INVALID',
      });
    }

    // --- Catch-all ---
    console.error('>>> [AUTH] JWT verify error:', err.message);
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
  }
}

module.exports = verifyToken;
