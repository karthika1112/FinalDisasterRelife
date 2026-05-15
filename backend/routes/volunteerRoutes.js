const express = require('express');
const router = express.Router();
const { registerVolunteer, getVolunteers, assignVolunteer, updateAvailability } = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getVolunteers);
router.post('/register', protect, registerVolunteer);
router.post('/assign', protect, authorize('admin'), assignVolunteer);
router.put('/availability', protect, updateAvailability);

module.exports = router;
