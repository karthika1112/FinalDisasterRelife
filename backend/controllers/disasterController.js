const path = require('path');
const fs   = require('fs');
const Disaster = require('../models/Disaster');

// @desc  Create disaster report
// @route POST /api/disasters
// @access Private
exports.createDisaster = async (req, res) => {
  const { title, description, location, disasterType, severity } = req.body;
  if (!title || !description || !location || !disasterType || !severity)
    return res.status(400).json({ success: false, message: 'title, description, location, disasterType and severity are required' });

  try {
    const data = { ...req.body, reportedBy: req.user._id };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const disaster = await Disaster.create(data);
    res.status(201).json({ success: true, data: disaster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all disasters (with optional filters)
// @route GET /api/disasters?status=&type=&severity=
// @access Public
exports.getDisasters = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.disasterType = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;

    const disasters = await Disaster.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedVolunteers', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: disasters.length, data: disasters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single disaster
// @route GET /api/disasters/:id
// @access Public
exports.getDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedVolunteers', 'name email')
      .populate('updates.updatedBy', 'name');
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });
    res.json({ success: true, data: disaster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update disaster
// @route PUT /api/disasters/:id
// @access Admin / Volunteer
exports.updateDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });
    res.json({ success: true, data: disaster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete disaster + remove image from disk
// @route DELETE /api/disasters/:id
// @access Admin
exports.deleteDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndDelete(req.params.id);
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });

    // Remove uploaded image file if it exists
    if (disaster.image) {
      const filePath = path.join(__dirname, '..', disaster.image);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.warn('Image delete warning:', err.message);
      });
    }

    res.json({ success: true, message: 'Disaster removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Add rescue update to a disaster
// @route POST /api/disasters/:id/updates
// @access Admin / Volunteer
exports.addUpdate = async (req, res) => {
  if (!req.body.message)
    return res.status(400).json({ success: false, message: 'Update message is required' });

  try {
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });
    disaster.updates.push({ message: req.body.message, updatedBy: req.user._id });
    await disaster.save();
    res.json({ success: true, data: disaster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
