const express = require('express');
const router  = express.Router();
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
} = require('../controllers/reliefController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route GET    /api/relief          — Private (own requests for user, all for admin/volunteer)
router.get('/',     protect, getRequests);

// @route GET    /api/relief/:id      — Private
router.get('/:id',  protect, getRequest);

// @route POST   /api/relief          — Private (any logged-in user)
router.post('/',    protect, createRequest);

// @route PUT    /api/relief/:id      — Admin / Volunteer
router.put('/:id',  protect, authorize('admin', 'volunteer'), updateRequest);

// @route DELETE /api/relief/:id      — Admin
router.delete('/:id', protect, authorize('admin'), deleteRequest);

module.exports = router;
