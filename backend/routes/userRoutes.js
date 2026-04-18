const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const resumeService = require('../services/resumeService');

// Protected routes
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post(
  '/resume/upload',
  authMiddleware,
  resumeService.uploadMiddleware(),
  userController.uploadResume
);
router.delete('/resume', authMiddleware, userController.deleteResume);
router.delete('/account', authMiddleware, userController.deleteAccount);

module.exports = router;
