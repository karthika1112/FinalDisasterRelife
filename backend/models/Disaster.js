const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    disasterType: {
      type: String,
      enum: ['flood', 'earthquake', 'fire', 'cyclone', 'landslide', 'drought', 'other'],
      required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    image: { type: String },
    status: { type: String, enum: ['reported', 'active', 'resolved'], default: 'reported' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    updates: [
      {
        message: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disaster', disasterSchema);
