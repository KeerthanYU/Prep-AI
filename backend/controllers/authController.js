const User = require('../models/User');

class AuthController {
  async registerOrLoginUser(req, res, next) {
    try {
      const { firebaseId, email, displayName } = req.body;

      if (!firebaseId || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user exists
      let user = await User.findOne({ firebaseId });

      if (user) {
        // Update last login
        user.updatedAt = new Date();
        await user.save();

        return res.status(200).json({
          message: 'User logged in successfully',
          user: {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            domain: user.domain,
            interviewReadinessScore: user.interviewReadinessScore,
            totalSessions: user.totalSessions,
          },
        });
      }

      // Create new user
      user = new User({
        firebaseId,
        email,
        displayName: displayName || email.split('@')[0],
      });

      await user.save();

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          domain: user.domain,
          interviewReadinessScore: user.interviewReadinessScore,
          totalSessions: user.totalSessions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findOne({ firebaseId: req.userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          domain: user.domain,
          resume: user.resume,
          interviewReadinessScore: user.interviewReadinessScore,
          totalSessions: user.totalSessions,
          averageScore: user.averageScore,
          domainStrengths: user.domainStrengths,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { displayName, domain } = req.body;
      const user = await User.findOne({ firebaseId: req.userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (displayName) {
        user.displayName = displayName;
      }

      if (domain && ['Software Engineering', 'Marketing', 'Finance', 'HR'].includes(domain)) {
        user.domain = domain;
      }

      user.updatedAt = new Date();
      await user.save();

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          displayName: user.displayName,
          domain: user.domain,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Logout is typically handled on the client side with Firebase SDK
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
