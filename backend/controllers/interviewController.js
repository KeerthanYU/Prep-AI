const User = require('../models/User');
const Interview = require('../models/Interview');
const interviewService = require('../services/interviewService');

class InterviewController {
  async startInterview(req, res, next) {
    try {
      const { domain } = req.body;
      const userId = req.userId;

      // Get user and resume content
      const user = await User.findOne({ firebaseId: userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!domain || !['Software Engineering', 'Marketing', 'Finance', 'HR'].includes(domain)) {
        return res.status(400).json({ error: 'Invalid domain' });
      }

      // Use resume content or empty string if no resume
      const resumeContent = user.resume?.fileUrl || 'No resume provided';

      // Start interview and get questions
      const interview = await interviewService.startInterview(
        user._id,
        domain,
        resumeContent
      );

      res.status(201).json({
        message: 'Interview started successfully',
        interview,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAnswer(req, res, next) {
    try {
      const { interviewId, questionIndex, userAnswer, answerType } = req.body;

      if (!interviewId || questionIndex === undefined || !userAnswer) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await interviewService.submitAnswer(
        interviewId,
        questionIndex,
        userAnswer,
        answerType || 'text'
      );

      res.status(200).json({
        message: 'Answer submitted successfully',
        evaluation: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeInterview(req, res, next) {
    try {
      const { interviewId } = req.body;

      if (!interviewId) {
        return res.status(400).json({ error: 'Interview ID is required' });
      }

      const result = await interviewService.completeInterview(interviewId);

      res.status(200).json({
        message: 'Interview completed successfully',
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewHistory(req, res, next) {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const skip = parseInt(req.query.skip) || 0;

      const user = await User.findOne({ firebaseId: userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const history = await interviewService.getInterviewHistory(
        user._id,
        limit,
        skip
      );

      res.status(200).json({
        message: 'Interview history retrieved',
        history,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewDetails(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.userId;

      const user = await User.findOne({ firebaseId: userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const interview = await interviewService.getInterviewDetails(
        interviewId,
        user._id.toString()
      );

      res.status(200).json({
        message: 'Interview details retrieved',
        interview,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const userId = req.userId;
      const user = await User.findOne({ firebaseId: userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get recent interviews for chart data
      const recentInterviews = await Interview.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('overallScore createdAt domain');

      res.status(200).json({
        message: 'Dashboard stats retrieved',
        stats: {
          interviewReadinessScore: user.interviewReadinessScore,
          totalSessions: user.totalSessions,
          averageScore: user.averageScore,
          domainStrengths: user.domainStrengths,
          recentInterviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InterviewController();
