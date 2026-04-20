const Interview = require('../models/Interview');
const User = require('../models/User');
const unifiedAIService = require('./unifiedAIService');

class InterviewService {
  /**
   * Start a new interview session
   * NEVER throws — falls back to default questions if AI fails
   */
  async startInterview(userId, domain, skills = [], difficulty = "medium") {
    console.log('[PIPELINE STEP] startInterview | userId:', userId, '| domain:', domain, '| skills:', skills?.length || 0, '| difficulty:', difficulty);

    try {
      const safeDomain = domain || 'Software Engineering';
      const safeSkills = Array.isArray(skills) ? skills.filter(s => typeof s === 'string' && s.trim()) : [];
      const safeDifficulty = difficulty || 'medium';

      // 1. Generate structured questions (mcq, descriptive, aptitude)
      console.log('[PIPELINE STEP] Requesting sectioned question generation...');
      const sectionedQuestions = await unifiedAIService.generateQuestions(
        safeDomain,
        safeSkills,
        safeDifficulty
      );

      // 2. Map sections into a flat array for the Interview model
      // Format: All MCQs first, then Descriptive, then Aptitude for a structured flow
      const flattenedQuestions = [
        ...sectionedQuestions.mcq.map(q => ({ ...q, type: 'mcq' })),
        ...sectionedQuestions.descriptive.map(q => ({ ...q, type: 'descriptive' })),
        ...sectionedQuestions.aptitude.map(q => ({ ...q, type: 'aptitude' }))
      ];

      // 3. Create interview record in MongoDB
      const interview = new Interview({
        userId,
        domain: safeDomain,
        difficulty: safeDifficulty,
        questionsCount: flattenedQuestions.length,
        questions: flattenedQuestions,
        status: 'in-progress',
      });

      await interview.save();
      console.log('[PIPELINE STEP] Interview created with sections:', interview._id);

      return {
        interviewId: interview._id,
        questions: sectionedQuestions, // Return structured for frontend UI sections
        domain: safeDomain,
        difficulty: safeDifficulty
      };
    } catch (error) {
      console.error('[AI ERROR] startInterview failed:', error.message);
      throw error;
    }
  }

  /**
   * Submit an answer for evaluation
   */
  async submitAnswer(interviewId, questionText, userAnswer, answerType = 'text') {
    console.log('[PIPELINE STEP] submitAnswer | interviewId:', interviewId);

    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) throw new Error('Interview not found');

      // Find the question in the interview's stored questions to see its type/correct answer
      const questionData = interview.questions.find(q => q.text === questionText);
      let evaluation = { score: 0, feedback: '', improvements: [] };

      if (questionData && (questionData.type === 'mcq' || questionData.type === 'aptitude')) {
        // --- AUTO-GRADING FOR MCQ/APTITUDE ---
        const isCorrect = userAnswer.trim().charAt(0).toUpperCase() === questionData.correctAnswer.trim().charAt(0).toUpperCase();
        evaluation = {
          score: isCorrect ? 100 : 0,
          feedback: isCorrect 
            ? `Correct! ${questionData.explanation || ''}` 
            : `Incorrect. The correct answer was ${questionData.correctAnswer}. ${questionData.explanation || ''}`,
          improvements: isCorrect ? [] : ["Review the concept mentioned in the explanation."]
        };
      } else {
        // --- AI EVALUATION FOR DESCRIPTIVE ---
        evaluation = await unifiedAIService.evaluateAnswer(
          questionText,
          userAnswer,
          interview.domain
        );
      }

      console.log('[PIPELINE STEP] Evaluation complete | score:', evaluation?.score);

      // Add answer to session
      const answerObj = {
        questionText,
        userAnswer,
        answerType,
        contentScore: evaluation.score || 0,
        communicationScore: evaluation.score || 0,
        confidenceScore: evaluation.score || 0,
        overallScore: evaluation.score || 0,
        feedback: evaluation.feedback || 'Answer recorded.',
      };

      interview.answers.push(answerObj);
      await interview.save();

      return {
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvements: evaluation.improvements || [],
      };
    } catch (error) {
      console.error('[AI ERROR] submitAnswer failed:', error.message);
      throw error;
    }
  }

  /**
   * Complete session and calculate summary
   */
  async completeInterview(interviewId) {
    console.log('[PIPELINE STEP] completeInterview | interviewId:', interviewId);

    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) throw new Error('Interview not found');

      const avgScore = interview.answers.length > 0
        ? Math.round(interview.answers.reduce((sum, a) => sum + (a.overallScore || 0), 0) / interview.answers.length)
        : 0;

      interview.overallScore = avgScore;
      interview.status = 'completed';
      interview.endTime = new Date();
      interview.duration = Math.round((interview.endTime - interview.startTime) / 1000);

      await interview.save();
      console.log('[PIPELINE STEP] Interview completed | avgScore:', avgScore);

      return {
        interviewId: interview._id,
        overallScore: avgScore,
        totalQuestions: interview.answers.length,
        answers: interview.answers,
      };
    } catch (error) {
      console.error('[AI ERROR] completeInterview failed:', error.message);
      throw error;
    }
  }

  async getInterviewHistory(userId, limit = 10, skip = 0) {
    return await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async getInterviewDetails(interviewId, userId) {
    const interview = await Interview.findById(interviewId);
    if (!interview || interview.userId.toString() !== userId) {
      throw new Error('Interview not found');
    }
    return interview;
  }
}

module.exports = new InterviewService();
