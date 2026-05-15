const mongoose = require('mongoose');

const reliefRequestSchema = new mongoose.Schema(
  {
    requestType: {
      type: String,
      enum: ['food', 'shelter', 'medical'],
      required: [true, 'Request type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    numberOfPeople: {
      type: Number,
      default: 1,
      min: [1, 'Must be at least 1 person'],
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      // pending → approved → completed  |  pending → rejected
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    disaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disaster',
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReliefRequest', reliefRequestSchema);
