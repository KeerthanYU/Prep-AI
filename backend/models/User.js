const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // If user signed up via Firebase Google, firebaseId will be set.
    // For local email/password users, firebaseId is optional.
    firebaseId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    // Hashed password for local auth (optional for social logins)
    password: {
      type: String,
      select: false,
    },
    displayName: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Fine-grained permissions for the user. Populated from role by default.
    permissions: {
      type: [String],
      default: [],
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
    resumeAnalysis: {
      extractedSkills: [String],
      relevantSkills: [String],
      missingSkills: [String],
      overallScore: { type: Number, min: 0, max: 100 },
      updatedAt: Date,
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
    skillsGap: [
      {
        skill: String,
        proficiency: { type: String, enum: ['basic', 'intermediate', 'advanced'] },
        priority: { type: String, enum: ['low', 'medium', 'high'] },
      },
    ],
    lastInterviewDate: Date,
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
      },
    ],
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

// Index for efficient queries
userSchema.index({ email: 1, createdAt: -1 });
userSchema.index({ role: 1 });

// Instance helper to return a safe public profile object
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    email: this.email,
    displayName: this.displayName,
    profilePicture: this.profilePicture,
    role: this.role,
    permissions: this.permissions || [],
    domain: this.domain,
    interviewReadinessScore: this.interviewReadinessScore,
    totalSessions: this.totalSessions,
  };
};

module.exports = mongoose.model('User', userSchema);

