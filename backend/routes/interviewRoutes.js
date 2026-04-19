const express = require('express');
const router = express.Router();

// ✅ FIXED IMPORTS
const interviewController = require('../controllers/interviewController');
const { verifyJWTToken } = require('../middleware/authMiddleware');

// Protected routes
router.post('/start', verifyJWTToken, interviewController.startInterview);
router.post('/submit-answer', verifyJWTToken, interviewController.submitAnswer);
router.post('/complete', verifyJWTToken, interviewController.completeInterview);

router.get('/history', verifyJWTToken, interviewController.getInterviewHistory);
router.get('/stats/dashboard', verifyJWTToken, interviewController.getDashboardStats);
router.get('/:interviewId', verifyJWTToken, interviewController.getInterviewDetails);

module.exports = router;