const User = require('../models/User');
const Interview = require('../models/Interview');
const interviewService = require('../services/interviewService');

/**
 * Start Interview API
 * Accepts skills from frontend (extracted from resume)
 */
exports.startInterview = async (req, res, next) => {
  try {
    const { domain, skills, difficulty } = req.body;
    const userId = req.userId;

    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }

    const interviewData = await interviewService.startInterview(
      userId,
      domain,
      skills || [],
      difficulty || 'medium'
    );

    res.status(201).json({
      success: true,
      message: 'Interview started successfully',
      data: interviewData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Answer API
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionText, userAnswer, answerType } = req.body;

    if (!interviewId || !questionText || !userAnswer) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const evaluation = await interviewService.submitAnswer(
      interviewId,
      questionText,
      userAnswer,
      answerType || 'text'
    );

    res.status(200).json({
      success: true,
      message: 'Answer evaluated',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Interview and get Report
 */
exports.completeInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, error: 'Interview ID is required' });
    }

    const report = await interviewService.completeInterview(interviewId);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

exports.getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const history = await interviewService.getInterviewHistory(userId);
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

exports.getInterviewDetails = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const userId = req.userId;
    const interview = await interviewService.getInterviewDetails(interviewId, userId);
    res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dashboard Stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const recentInterviews = await Interview.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('overallScore createdAt domain status');

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      stats: {
        interviewReadinessScore: user.interviewReadinessScore || 0,
        totalSessions: user.totalSessions || 0,
        averageScore: user.averageScore || 0,
        domainStrengths: user.domainStrengths || {},
        recentInterviews,
      },
    });
  } catch (error) {
    next(error);
  }
};