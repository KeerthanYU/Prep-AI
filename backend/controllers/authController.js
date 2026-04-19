const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getPermissionsForRole } = require('../config/roles');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

function signJwt(user) {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    permissions: user.permissions || [],
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

class AuthController {
  // Email/password signup
  async signup(req, res, next) {
    try {
      console.log('signup request body:', JSON.stringify(req.body || {}));
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Conflict', message: 'Email already registered' });
      }

      const hashed = await bcrypt.hash(password, SALT_ROUNDS);

      const role = 'user';
      const permissions = getPermissionsForRole(role);

      const user = new User({
        email,
        password: hashed,
        displayName: displayName || email.split('@')[0],
        role,
        permissions,
      });

      await user.save();

      const token = signJwt(user);

      res.status(201).json({
        message: 'User registered',
        sessionToken: token,
        user: user.toPublic(),
      });
    } catch (err) {
      next(err);
    }
  }

  // Email/password login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' });
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });

      // Ensure permissions exist
      if (!user.permissions || user.permissions.length === 0) {
        user.permissions = getPermissionsForRole(user.role);
        await user.save();
      }

      const token = signJwt(user);

      res.status(200).json({ message: 'Logged in', sessionToken: token, user: user.toPublic() });
    } catch (err) {
      next(err);
    }
  }

  // Firebase social login (Google)
  // Firebase social auth removed to simplify flow: use email/password (signup/login)

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
      res.status(200).json({ user: user.toPublic() });
    } catch (err) {
      next(err);
    }
  }

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
      const token = signJwt(user);
      res.status(200).json({ message: 'Token refreshed', sessionToken: token });
    } catch (err) {
      next(err);
    }
  }

  // Update profile
  async updateProfile(req, res, next) {
    try {
      const { displayName, domain } = req.body;
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
      if (displayName) user.displayName = displayName;
      if (domain) user.domain = domain;
      user.updatedAt = new Date();
      await user.save();
      res.status(200).json({ message: 'Profile updated', user: user.toPublic() });
    } catch (err) {
      next(err);
    }
  }

  // Logout (stateless JWT - client should delete token)
  async logout(req, res, next) {
    try {
      res.status(200).json({ message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  }

  // Delete account
  async deleteAccount(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
      await User.deleteOne({ _id: req.userId });
      try {
        if (user.firebaseId) await admin.auth().deleteUser(user.firebaseId);
      } catch (e) {
        console.warn('Failed to delete Firebase user:', e.message);
      }
      res.status(200).json({ message: 'Account deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
