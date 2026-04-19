const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authJwt');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRequest, sanitizeBody, schemas } = require('../middleware/validation');

// Public routes
router.post('/signup', authLimiter, sanitizeBody, validateRequest(schemas.register), authController.signup);
router.post('/login', authLimiter, sanitizeBody, validateRequest(schemas.login), authController.login);
// Firebase social login (Google)
// Removed Firebase social login to simplify auth flow (email/password JWT only)

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.put('/profile', verifyToken, sanitizeBody, validateRequest(schemas.profileUpdate), authController.updateProfile);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', verifyToken, authController.refreshToken);
router.delete('/account', verifyToken, authController.deleteAccount);

module.exports = router;

