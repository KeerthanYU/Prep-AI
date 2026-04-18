const User = require('../models/User');
const resumeService = require('../services/resumeService');

class UserController {
  async uploadResume(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      resumeService.validateResumeFile(req.file);

      const user = await User.findOne({ firebaseId: req.userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete old resume if exists
      if (user.resume && user.resume.fileName) {
        await resumeService.deleteResume(
          resumeService.getResumeFilePath(user.resume.fileName)
        );
      }

      // Extract resume content
      const resumeData = resumeService.extractTextFromResume(req.file.path);

      // Save resume info to user
      user.resume = resumeData;
      await user.save();

      res.status(200).json({
        message: 'Resume uploaded successfully',
        resume: resumeData,
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        resumeService.deleteResume(req.file.path);
      }
      next(error);
    }
  }

  async deleteResume(req, res, next) {
    try {
      const user = await User.findOne({ firebaseId: req.userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.resume && user.resume.fileName) {
        await resumeService.deleteResume(
          resumeService.getResumeFilePath(user.resume.fileName)
        );
        user.resume = null;
        await user.save();
      }

      res.status(200).json({
        message: 'Resume deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProfile(req, res, next) {
    try {
      const user = await User.findOne({ firebaseId: req.userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        profile: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          domain: user.domain,
          resume: user.resume,
          interviewReadinessScore: user.interviewReadinessScore,
          totalSessions: user.totalSessions,
          averageScore: user.averageScore,
          domainStrengths: user.domainStrengths,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { displayName, domain, profilePicture } = req.body;
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

      if (profilePicture) {
        user.profilePicture = profilePicture;
      }

      user.updatedAt = new Date();
      await user.save();

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: {
          displayName: user.displayName,
          domain: user.domain,
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const user = await User.findOne({ firebaseId: req.userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete resume if exists
      if (user.resume && user.resume.fileName) {
        await resumeService.deleteResume(
          resumeService.getResumeFilePath(user.resume.fileName)
        );
      }

      // Delete user and associated interviews
      await User.deleteOne({ _id: user._id });
      await Interview.deleteMany({ userId: user._id });

      res.status(200).json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
