const Volunteer = require('../models/Volunteer');
const Disaster = require('../models/Disaster');
const User = require('../models/User');

exports.registerVolunteer = async (req, res) => {
  try {
    const exists = await Volunteer.findOne({ user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: 'Already registered as volunteer' });

    const volunteer = await Volunteer.create({ user: req.user._id, skills: req.body.skills });
    await User.findByIdAndUpdate(req.user._id, { role: 'volunteer' });
    res.status(201).json({ success: true, data: volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user', 'name email phone location');
    res.json({ success: true, data: volunteers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignVolunteer = async (req, res) => {
  try {
    const { volunteerId, disasterId } = req.body;
    const disaster = await Disaster.findById(disasterId);
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });

    if (!disaster.assignedVolunteers.includes(volunteerId)) {
      disaster.assignedVolunteers.push(volunteerId);
      await disaster.save();
    }

    await Volunteer.findOneAndUpdate(
      { user: volunteerId },
      { $addToSet: { assignedDisasters: disasterId }, availability: false }
    );

    res.json({ success: true, message: 'Volunteer assigned successfully', data: disaster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOneAndUpdate(
      { user: req.user._id },
      { availability: req.body.availability },
      { new: true }
    );
    res.json({ success: true, data: volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
