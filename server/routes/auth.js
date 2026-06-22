import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ─── Custom auth endpoints (OAuth is handled by @auth/express in server.js) ───

// Get current user profile (populated by @auth/express session)
router.get('/profile', async (req, res) => {
  try {
    if (!req.auth?.user?.id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(req.auth.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user role (student / educator)
router.put('/role', async (req, res) => {
  try {
    if (!req.auth?.user?.id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { role } = req.body;
    if (!['student', 'educator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.auth.user.id,
      { role },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check auth status
router.get('/status', (req, res) => {
  if (req.auth?.user) {
    res.json({
      success: true,
      authenticated: true,
      user: req.auth.user,
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
    });
  }
});

export default router;