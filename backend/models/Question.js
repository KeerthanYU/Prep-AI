const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      enum: ['Software Engineering', 'Marketing', 'Finance', 'HR'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    skills: [String], // e.g., ['Communication', 'Problem Solving']
    expectedAnswerOutline: String,
    followUpQuestions: [String],
    isGenerated: {
      type: Boolean,
      default: false,
    },
    generatedForUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resumeContext: String, // context from resume for personalization
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
