const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: [{ type: String }],
    availability: { type: Boolean, default: true },
    assignedDisasters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' }],
    completedMissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
