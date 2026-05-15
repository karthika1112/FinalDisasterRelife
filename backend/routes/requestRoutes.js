const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
} = require('../controllers/reliefController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET  /api/requests
// @desc    Get all requests (admin/volunteer) or own requests (user)
// @access  Private
router.get('/', protect, getRequests);

// @route   GET  /api/requests/:id
// @desc    Get single request
// @access  Private
router.get('/:id', protect, getRequest);

// @route   POST /api/requests
// @desc    Submit a new relief request
// @access  Private
router.post('/', protect, createRequest);

// @route   PUT  /api/requests/:id
// @desc    Update request status
// @access  Admin / Volunteer
router.put('/:id', protect, authorize('admin', 'volunteer'), updateRequest);

// @route   DELETE /api/requests/:id
// @desc    Delete a request
// @access  Admin
router.delete('/:id', protect, authorize('admin'), deleteRequest);

module.exports = router;
