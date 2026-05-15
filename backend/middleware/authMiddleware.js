const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  const token = authHeader.split(' ')[1];
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });
    req.user = user;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Token invalid';
    res.status(401).json({ success: false, message });
  }
};

/**
 * authorize — restricts access to specific roles
 * Usage: authorize('admin', 'volunteer')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not authorized to access this route`,
    });
  next();
};

module.exports = { protect, authorize };
