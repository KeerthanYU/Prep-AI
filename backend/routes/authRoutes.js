const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authJwt');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes - no strict validation, just sanitize inputs
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/google-login', authLimiter, authController.googleLogin);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/refresh-token', verifyToken, authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;

