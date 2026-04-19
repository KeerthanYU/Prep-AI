const mongoose = require('mongoose');
const { getPermissionsForRole } = require('../config/roles');

const userSchema = new mongoose.Schema(
  {
    firebaseId: {
      type: String,
      unique: true,
      sparse: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
    },

    displayName: {
      type: String,
      default: "",
    },

    // 🔥 FIXED: align with Firebase
    photoURL: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    permissions: {
      type: [String],
      default: [],
    },

    domain: {
      type: String,
      enum: ["Software Engineering", "Marketing", "Finance", "HR", null],
      default: undefined,
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
        proficiency: {
          type: String,
          enum: ["basic", "intermediate", "advanced"],
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
        },
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
  },
  { timestamps: true }
);

// Ensure permissions are set from role on save if not provided
userSchema.pre('save', function (next) {
  if (!this.permissions || this.permissions.length === 0) {
    this.permissions = getPermissionsForRole(this.role || 'user');
  }
  next();
});

// Normalize domain: if explicitly null, unset so enum validation won't fail
userSchema.pre('validate', function (next) {
  if (this.domain === null) {
    this.domain = undefined;
  }
  next();
});

// Indexes
userSchema.index({ email: 1, createdAt: -1 });
userSchema.index({ role: 1 });

// Instance helper to return a safe public profile object
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    email: this.email,
    displayName: this.displayName,
    profilePicture: this.photoURL || this.profilePicture || null,
    role: this.role,
    permissions: this.permissions || [],
    domain: this.domain,
    interviewReadinessScore: this.interviewReadinessScore,
    totalSessions: this.totalSessions,
  };
};

module.exports = mongoose.model('User', userSchema);