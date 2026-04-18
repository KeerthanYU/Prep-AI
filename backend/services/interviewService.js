const Interview = require('../models/Interview');
const User = require('../models/User');
const groqService = require('./groqService');

class InterviewService {
  async startInterview(userId, domain, resumeContent) {
    try {
      // Generate questions based on domain and resume
      const questions = await groqService.generateQuestions(
        domain,
        resumeContent,
        'easy',
        5
      );

      // Create interview record
      const interview = new Interview({
        userId,
        domain,
        questionsCount: questions.length,
        difficulty: 'easy',
        status: 'in-progress',
      });

      await interview.save();

      return {
        interviewId: interview._id,
        questions,
        domain,
      };
    } catch (error) {
      console.error('Start interview error:', error.message);
      throw error;
    }
  }

  async submitAnswer(interviewId, questionIndex, userAnswer, answerType = 'text') {
    try {
      const interview = await Interview.findById(interviewId);

      if (!interview) {
        throw new Error('Interview not found');
      }

      if (interview.status !== 'in-progress') {
        throw new Error('Interview is not in progress');
      }

      // Evaluate answer using Groq
      const evaluation = await groqService.evaluateAnswer(
        `Question ${questionIndex + 1}`,
        userAnswer,
        interview.domain
      );

      // Calculate overall score for this answer
      const overallScore = Math.round(
        (evaluation.contentScore +
          evaluation.communicationScore +
          evaluation.confidenceScore) /
          3
      );

      // Add answer to interview
      const answerObj = {
        questionId: questionIndex,
        questionText: `Question ${questionIndex + 1}`,
        userAnswer,
        answerType,
        contentScore: evaluation.contentScore,
        communicationScore: evaluation.communicationScore,
        confidenceScore: evaluation.confidenceScore,
        overallScore,
        feedback: evaluation.contentFeedback,
      };

      interview.answers.push(answerObj);
      await interview.save();

      return {
        overallScore,
        contentScore: evaluation.contentScore,
        communicationScore: evaluation.communicationScore,
        confidenceScore: evaluation.confidenceScore,
        feedback: {
          content: evaluation.contentFeedback,
          communication: evaluation.communicationFeedback,
          confidence: evaluation.confidenceFeedback,
        },
      };
    } catch (error) {
      console.error('Submit answer error:', error.message);
      throw error;
    }
  }

  async completeInterview(interviewId) {
    try {
      const interview = await Interview.findById(interviewId);

      if (!interview) {
        throw new Error('Interview not found');
      }

      // Calculate average scores
      if (interview.answers.length > 0) {
        const avgContent =
          interview.answers.reduce((sum, a) => sum + a.contentScore, 0) /
          interview.answers.length;
        const avgCommunication =
          interview.answers.reduce((sum, a) => sum + a.communicationScore, 0) /
          interview.answers.length;
        const avgConfidence =
          interview.answers.reduce((sum, a) => sum + a.confidenceScore, 0) /
          interview.answers.length;
        const overall = Math.round(
          (avgContent + avgCommunication + avgConfidence) / 3
        );

        interview.averageContentScore = Math.round(avgContent);
        interview.averageCommunicationScore = Math.round(avgCommunication);
        interview.averageConfidenceScore = Math.round(avgConfidence);
        interview.overallScore = overall;
      }

      interview.status = 'completed';
      interview.endTime = new Date();
      interview.duration = Math.round(
        (interview.endTime - interview.startTime) / 1000
      );

      await interview.save();

      // Update user stats
      await this._updateUserStats(interview.userId, interview);

      // Generate personalized feedback
      const feedback = await groqService.generateFeedback(
        interview.answers,
        interview.domain
      );

      return {
        overallScore: interview.overallScore,
        contentScore: interview.averageContentScore,
        communicationScore: interview.averageCommunicationScore,
        confidenceScore: interview.averageConfidenceScore,
        feedback,
        duration: interview.duration,
      };
    } catch (error) {
      console.error('Complete interview error:', error.message);
      throw error;
    }
  }

  async getInterviewHistory(userId, limit = 10, skip = 0) {
    try {
      const interviews = await Interview.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('domain overallScore createdAt status duration');

      const total = await Interview.countDocuments({ userId });

      return {
        interviews,
        total,
        hasMore: skip + limit < total,
      };
    } catch (error) {
      console.error('Get interview history error:', error.message);
      throw error;
    }
  }

  async getInterviewDetails(interviewId, userId) {
    try {
      const interview = await Interview.findById(interviewId);

      if (!interview || interview.userId.toString() !== userId) {
        throw new Error('Interview not found or unauthorized');
      }

      return interview;
    } catch (error) {
      console.error('Get interview details error:', error.message);
      throw error;
    }
  }

  async _updateUserStats(userId, interview) {
    try {
      const user = await User.findById(userId);

      if (!user) return;

      user.totalSessions = (user.totalSessions || 0) + 1;

      // Calculate new average score
      const newAverage =
        (user.averageScore * (user.totalSessions - 1) +
          interview.overallScore) /
        user.totalSessions;
      user.averageScore = Math.round(newAverage);

      // Update domain strengths
      user.domainStrengths.contentScore =
        (user.domainStrengths.contentScore * (user.totalSessions - 1) +
          interview.averageContentScore) /
        user.totalSessions;
      user.domainStrengths.communicationScore =
        (user.domainStrengths.communicationScore * (user.totalSessions - 1) +
          interview.averageCommunicationScore) /
        user.totalSessions;
      user.domainStrengths.confidenceScore =
        (user.domainStrengths.confidenceScore * (user.totalSessions - 1) +
          interview.averageConfidenceScore) /
        user.totalSessions;

      // Calculate Interview Readiness Score (0-100)
      user.interviewReadinessScore = Math.min(
        100,
        Math.round(user.averageScore * 1.2)
      );

      await user.save();
    } catch (error) {
      console.error('Update user stats error:', error.message);
    }
  }
}

module.exports = new InterviewService();
