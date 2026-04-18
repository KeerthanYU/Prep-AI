const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      req.userId = decodedToken.uid;
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authMiddleware;
