const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Core authentication
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include by default in queries
    },
    firebaseId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Profile
    name: {
      type: String,
      default: '',
    },
    photoURL: {
      type: String,
      default: null,
    },

    // Authorization
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    permissions: {
      type: [String],
      default: [],
    },

    // Interview tracking (simple)
    totalInterviews: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Metadata
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Auto-populate permissions based on role before saving
userSchema.pre('save', function (next) {
  const rolePermissions = {
    user: ['view_dashboard', 'take_interview', 'view_profile'],
    admin: ['view_dashboard', 'take_interview', 'view_profile', 'manage_users', 'view_analytics'],
  };
  this.permissions = rolePermissions[this.role] || [];
  next();
});

// Index for fast email lookups
userSchema.index({ email: 1 });

// Public profile helper
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    photoURL: this.photoURL,
    role: this.role,
    permissions: this.permissions,
    totalInterviews: this.totalInterviews,
    averageScore: this.averageScore,
  };
};

module.exports = mongoose.model('User', userSchema);