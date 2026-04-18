const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/start', authMiddleware, interviewController.startInterview);
router.post('/submit-answer', authMiddleware, interviewController.submitAnswer);
router.post('/complete', authMiddleware, interviewController.completeInterview);
router.get('/history', authMiddleware, interviewController.getInterviewHistory);
router.get('/:interviewId', authMiddleware, interviewController.getInterviewDetails);
router.get('/stats/dashboard', authMiddleware, interviewController.getDashboardStats);

module.exports = router;
