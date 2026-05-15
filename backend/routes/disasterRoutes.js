const express = require('express');
const router = express.Router();
const {
  createDisaster,
  getDisasters,
  getDisaster,
  updateDisaster,
  deleteDisaster,
  addUpdate,
} = require('../controllers/disasterController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// @route GET  /api/disasters          — Public
router.get('/', getDisasters);

// @route GET  /api/disasters/:id      — Public
router.get('/:id', getDisaster);

// @route POST /api/disasters          — Private
router.post('/', protect, upload.single('image'), createDisaster);

// @route PUT  /api/disasters/:id      — Admin / Volunteer
router.put('/:id', protect, authorize('admin', 'volunteer'), updateDisaster);

// @route DELETE /api/disasters/:id    — Admin
router.delete('/:id', protect, authorize('admin'), deleteDisaster);

// @route POST /api/disasters/:id/updates — Admin / Volunteer
router.post('/:id/updates', protect, authorize('admin', 'volunteer'), addUpdate);

module.exports = router;
