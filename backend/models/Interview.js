const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: String,
  questionText: String,
  userAnswer: String,
  answerType: {
    type: String,
    enum: ['text', 'voice'],
  },
  contentScore: { type: Number, min: 0, max: 100 },
  communicationScore: { type: Number, min: 0, max: 100 },
  confidenceScore: { type: Number, min: 0, max: 100 },
  overallScore: { type: Number, min: 0, max: 100 },
  feedback: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
  },
  timestamp: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: String,
      enum: ['Software Engineering', 'Marketing', 'Finance', 'HR'],
      required: true,
    },
    sessionTitle: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // in seconds
    },
    questionsCount: {
      type: Number,
      default: 5,
    },
    questions: [
      {
        text: String,
        type: {
          type: String,
          enum: ['mcq', 'descriptive', 'aptitude'],
          default: 'descriptive'
        },
        options: [String], // for mcq/aptitude
        correctAnswer: String, // for mcq/aptitude
        explanation: String, // for aptitude
        category: String
      }
    ],
    answers: [answerSchema],
    averageContentScore: { type: Number, min: 0, max: 100 },
    averageCommunicationScore: { type: Number, min: 0, max: 100 },
    averageConfidenceScore: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
