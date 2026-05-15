const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const userPayload = (user, token) => ({
  success: true,
  data: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    token,
  },
});

// @desc  Register new user
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, phone, location });
    res.status(201).json(userPayload(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is deactivated' });

    res.json(userPayload(user, generateToken(user._id)));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get logged-in user profile
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// @desc  Update password
// @route PUT /api/auth/password
// @access Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Both current and new password are required' });

  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
