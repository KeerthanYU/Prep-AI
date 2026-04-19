const admin = require('firebase-admin');
const verifyToken = require('./authJwt');
const { checkRole } = require('./authorization');

// Backwards-compatible Firebase token verifier (kept for routes that expect Firebase tokens)
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No authorization token provided' });
    }
    const token = authHeader.substring(7);
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.firebaseUser = decoded;
      req.userId = decoded.uid;
      req.userEmail = decoded.email;
      next();
    } catch (e) {
      console.error('Firebase token verify error:', e.message);
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid Firebase token' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Authentication verification failed' });
  }
};

// Expose verifyToken under legacy name verifyJWTToken for minimal changes
module.exports = {
  verifyFirebaseToken,
  verifyJWTToken: verifyToken,
  requireAdmin: checkRole(['admin']),
  authMiddleware: verifyFirebaseToken,
};

