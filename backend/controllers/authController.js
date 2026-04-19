const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyToken, admin } = require('../config/firebaseConfig');

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

      // Check if user has a password (they might have registered via Google)
      if (!user.password) {
        return res.status(401).json({ 
          message: 'This account was created using Google. Please use Google Login.',
          debug_reason: 'Password missing for this account'
        });
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
    console.log('>>> [DEBUG] Google Login Attempt');
    try {
      const { idToken } = req.body;
      console.log("TOKEN RECEIVED:", idToken?.slice(0, 40));
      console.log("ADMIN INITIALIZED:", admin.apps.length);

      if (!idToken) {
        console.error('>>> [DEBUG] Failure: idToken is missing in req.body');
        return res.status(400).json({
          message: 'ID Token required',
          debug_reason: 'Missing idToken in request body'
        });
      }

      // Verify Firebase ID Token
      let decodedToken;
      try {
        decodedToken = await verifyToken(idToken);
        console.log('>>> [DEBUG] Token Verified Successfully');
        // console.log('>>> [DEBUG] Decoded Token:', JSON.stringify(decodedToken, null, 2));
      } catch (error) {
        console.error('>>> [DEBUG] Failure: Firebase Token Verification Failed:', error.message);
        return res.status(401).json({
          message: 'Invalid or expired Google token',
          debug_reason: error.message
        });
      }

      const { email, name, picture, uid } = decodedToken;

      if (!email) {
        console.error('>>> [DEBUG] Failure: Email not found in decoded token');
        return res.status(400).json({
          message: 'Email not found in Google token',
          debug_reason: 'Decoded token does not contain email'
        });
      }

      console.log('>>> [DEBUG] User Identity:', email, '(UID:', uid, ')');

      // Try finding by firebaseId first, then by email
      let user = await User.findOne({ firebaseId: uid });

      if (!user) {
        user = await User.findOne({ email: email.toLowerCase() });
      }

      if (!user) {
        console.log('>>> [DEBUG] Creating new user for:', email);
        user = await User.create({
          email: email.toLowerCase(),
          name: name || 'Google User',
          photoURL: picture || '',
          firebaseId: uid,
          role: 'user',
        });
      } else {
        console.log('>>> [DEBUG] Existing user found:', email);
        // Update profile data if it changed
        let hasChanges = false;
        if (name && user.name !== name) {
          user.name = name;
          hasChanges = true;
        }
        if (picture && user.photoURL !== picture) {
          user.photoURL = picture;
          hasChanges = true;
        }
        if (!user.firebaseId) {
          user.firebaseId = uid;
          hasChanges = true;
        }

        if (hasChanges) {
          console.log('>>> [DEBUG] Updating user profile data');
          await user.save();
        }
      }

      const token = signJwt(user);
      console.log('>>> [DEBUG] Login Successful, sending session token');

      res.status(200).json({
        message: 'Google login successful',
        token,
        user: user.toPublic(),
      });
    } catch (err) {
      console.error('>>> [DEBUG] Unexpected Error in googleLogin:', err);
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

  // REFRESH TOKEN
  async refreshToken(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const token = signJwt(user);

      res.status(200).json({
        message: 'Token refreshed successfully',
        token,
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