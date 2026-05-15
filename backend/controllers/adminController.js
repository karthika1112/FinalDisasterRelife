const path = require('path');
const fs   = require('fs');
const User         = require('../models/User');
const Disaster     = require('../models/Disaster');
const ReliefRequest= require('../models/ReliefRequest');
const Volunteer    = require('../models/Volunteer');

// ── Analytics ────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalDisasters, totalRequests, totalVolunteers] = await Promise.all([
      User.countDocuments(),
      Disaster.countDocuments(),
      ReliefRequest.countDocuments(),
      Volunteer.countDocuments(),
    ]);

    const [disastersByStatus, disastersByType, requestsByType, requestsByStatus] = await Promise.all([
      Disaster.aggregate([{ $group: { _id: '$status',      count: { $sum: 1 } } }]),
      Disaster.aggregate([{ $group: { _id: '$disasterType',count: { $sum: 1 } } }]),
      ReliefRequest.aggregate([{ $group: { _id: '$requestType', count: { $sum: 1 } } }]),
      ReliefRequest.aggregate([{ $group: { _id: '$status',      count: { $sum: 1 } } }]),
    ]);

    // Recent 5 disasters
    const recentDisasters = await Disaster.find()
      .sort('-createdAt').limit(5)
      .populate('reportedBy', 'name');

    res.json({
      success: true,
      data: {
        totalUsers, totalDisasters, totalRequests, totalVolunteers,
        disastersByStatus, disastersByType,
        requestsByType, requestsByStatus,
        recentDisasters,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Users ─────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    delete req.body.password;

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent changing an admin's role — there must always be one admin
    if (target.role === 'admin' && req.body.role && req.body.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin role cannot be changed' });

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Protect the only admin — cannot delete another admin account
    if (user.role === 'admin')
      return res.status(403).json({ success: false, message: 'Admin account cannot be deleted' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Disasters ─────────────────────────────────────────────────
exports.getAllDisasters = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status      = req.query.status;
    if (req.query.severity) filter.severity    = req.query.severity;
    if (req.query.type)     filter.disasterType= req.query.type;

    const disasters = await Disaster.find(filter)
      .populate('reportedBy', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: disasters.length, data: disasters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminDeleteDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndDelete(req.params.id);
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });

    if (disaster.image) {
      const filePath = path.join(__dirname, '..', disaster.image);
      fs.unlink(filePath, (e) => { if (e && e.code !== 'ENOENT') console.warn(e.message); });
    }
    res.json({ success: true, message: 'Disaster deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminUpdateDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });
    res.json({ success: true, data: disaster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Relief Requests ───────────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status      = req.query.status;
    if (req.query.type)   filter.requestType = req.query.type;

    const requests = await ReliefRequest.find(filter)
      .populate('requestedBy',      'name email')
      .populate('assignedVolunteer','name email')
      .sort('-createdAt');
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminUpdateRequest = async (req, res) => {
  try {
    const request = await ReliefRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('requestedBy', 'name email');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminDeleteRequest = async (req, res) => {
  try {
    const request = await ReliefRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
