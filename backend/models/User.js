const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: null,
    },
    domain: {
      type: String,
      enum: ['Software Engineering', 'Marketing', 'Finance', 'HR'],
      default: null,
    },
    resume: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
    },
    interviewReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    domainStrengths: {
      contentScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
