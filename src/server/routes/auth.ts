import { Router } from 'express';
import { db } from '../db.js';
import { generateToken, hashPassword, comparePassword, protect, AuthRequest } from '../auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'user' as const,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    const token = generateToken(newUser._id);
    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userSafe
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);
    const { password: _, ...userSafe } = user;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userSafe
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.'
    });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req: AuthRequest, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

// PUT /api/auth/profile
router.put('/profile', protect, (req: AuthRequest, res) => {
  try {
    const { name, phone } = req.body;
    const user = db.users.find(u => u._id === req.user?._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/password
router.put('/password', protect, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const user = db.users.find(u => u._id === req.user?._id);
    if (!user || !user.password) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = await hashPassword(newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
