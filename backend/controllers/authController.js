const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Helper: JWT
function signJwt(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

class AuthController {
  // SIGNUP
  async signup(req, res, next) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'user',
      });

      const token = signJwt(user);

      res.status(201).json({
        message: 'Signup successful',
        token,
        user: user.toPublic(),
      });
    } catch (err) {
      next(err);
    }
  }

  // LOGIN
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signJwt(user);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: user.toPublic(),
      });
    } catch (err) {
      next(err);
    }
  }

  // GOOGLE LOGIN
  async googleLogin(req, res, next) {
    try {
      const { email, name, photoURL } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email required' });
      }

      let user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        user = await User.create({
          email: email.toLowerCase(),
          name: name || 'Google User',
          photoURL: photoURL || '',
          role: 'user',
        });
      } else {
        if (name) user.name = name;
        if (photoURL) user.photoURL = photoURL;
        await user.save();
      }

      const token = signJwt(user);

      res.status(200).json({
        message: 'Google login successful',
        token,
        user: user.toPublic(),
      });
    } catch (err) {
      next(err);
    }
  }

  // PROFILE
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json({ user: user.toPublic() });
    } catch (err) {
      next(err);
    }
  }

  // UPDATE PROFILE
  async updateProfile(req, res, next) {
    try {
      const { name, photoURL } = req.body;

      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (photoURL !== undefined) user.photoURL = photoURL;

      await user.save();

      res.json({
        message: 'Profile updated',
        user: user.toPublic(),
      });
    } catch (err) {
      next(err);
    }
  }

  // LOGOUT
  async logout(req, res) {
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();