const mongoose = require('mongoose');

const shoutoutRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personality: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shoutoutOption: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    required: true
  },
  personalityAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal'],
    required: true
  },
  audioUrl: {
    type: String
  },
  duration: {
    type: Number // in seconds
  },
  notes: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
shoutoutRequestSchema.index({ requester: 1, status: 1 });
shoutoutRequestSchema.index({ personality: 1, status: 1 });
shoutoutRequestSchema.index({ status: 1 });

const ShoutoutRequest = mongoose.model('ShoutoutRequest', shoutoutRequestSchema);

module.exports = ShoutoutRequest; 