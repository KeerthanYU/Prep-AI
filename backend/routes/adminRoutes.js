const express = require('express');
const router = express.Router();
const { verifyJWTToken, requireAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Interview = require('../models/Interview');

/**
 * GET /api/admin/users
 * Get all users (paginated)
 */
router.get('/users', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-loginHistory -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users/:userId
 * Get user details
 */
router.get('/users/:userId', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-loginHistory');

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Get user's interview statistics
    const interviews = await Interview.countDocuments({ userId: req.params.userId });
    const totalScore = await Interview.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.params.userId) } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$overallScore' },
          totalInterviews: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      user,
      stats: {
        totalInterviews: interviews,
        averageScore: totalScore[0]?.avgScore || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete user account (soft/hard delete)
 */
router.delete('/users/:userId', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Delete all user's interviews
    await Interview.deleteMany({ userId: req.params.userId });

    // Delete user
    await User.deleteOne({ _id: req.params.userId });

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/users/:userId/role
 * Update user role
 */
router.put('/users/:userId/role', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid role. Must be "user" or "admin".',
      });
    }

    const permissions = require('../config/roles').getPermissionsForRole(role);
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role, permissions, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/interviews
 * Get all interviews (paginated)
 */
router.get('/interviews', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find()
      .populate('userId', 'email displayName domain')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Interview.countDocuments();

    res.status(200).json({
      interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Average scores
    const avgScores = await Interview.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$overallScore' },
          minScore: { $min: '$overallScore' },
          maxScore: { $max: '$overallScore' },
        },
      },
    ]);

    // Users by domain
    const usersByDomain = await User.aggregate([
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      summary: {
        totalUsers,
        totalInterviews,
        totalAdmins,
        avgUserScore: avgScores[0]?.avgScore || 0,
        minScore: avgScores[0]?.minScore || 0,
        maxScore: avgScores[0]?.maxScore || 0,
      },
      usersByDomain,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
