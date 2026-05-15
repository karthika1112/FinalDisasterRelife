const express = require('express');
const router  = express.Router();
const {
  getAnalytics,
  getUsers, updateUser, deleteUser,
  getAllDisasters, adminDeleteDisaster, adminUpdateDisaster,
  getAllRequests,  adminUpdateRequest,  adminDeleteRequest,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require login + admin role
router.use(protect, authorize('admin'));

// Analytics
router.get('/analytics', getAnalytics);

// Users
router.get   ('/users',     getUsers);
router.put   ('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Disasters
router.get   ('/disasters',     getAllDisasters);
router.put   ('/disasters/:id', adminUpdateDisaster);
router.delete('/disasters/:id', adminDeleteDisaster);

// Relief Requests
router.get   ('/requests',     getAllRequests);
router.put   ('/requests/:id', adminUpdateRequest);
router.delete('/requests/:id', adminDeleteRequest);

module.exports = router;
