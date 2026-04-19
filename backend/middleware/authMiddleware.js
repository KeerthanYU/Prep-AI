const verifyToken = require('./authJwt');

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin' && (!req.user || req.user.role !== 'admin')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: Admin privileges required'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyJWTToken: verifyToken,
  requireAdmin,
};

