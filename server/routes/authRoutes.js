import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  const { username, email, password } = validatedData;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists',
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    },
  });
});

// Login
router.post('/login', async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  const { email, password } = validatedData;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    },
  });
});

// Logout
router.post('/logout', protect, (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Get current user
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
    },
  });
});

export default router;
