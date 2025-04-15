const mongoose = require('mongoose');

const audioRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.requesterEmail; // Only required if requesterEmail is not provided
    }
  },
  requesterEmail: {
    type: String,
    required: function() {
      return !this.requester; // Only required if requester is not provided
    },
    trim: true,
    lowercase: true
  },
  requesterName: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pricingOption: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  pricingDetails: {
    title: String,
    price: Number,
    type: {
      type: String,
      enum: ['personal', 'business'],
      required: true
    }
  },
  requestDetails: {
    type: String,
    required: true,
    trim: true
  },
  occasion: {
    type: String,
    trim: true
  },
  forWhom: {
    type: String,
    trim: true
  },
  pronunciation: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: [
      'pending',           // Initial state when request is created
      'payment_authorized', // Payment is authorized but not captured
      'accepted',          // Creator has accepted the request
      'in_progress',       // Creator is working on the audio
      'ready_for_review',  // Audio is uploaded and ready for review
      'approved',          // Requester has approved the audio
      'rejected',          // Requester has rejected the audio
      'disputed',          // Request is in dispute
      'completed',         // Payment released and request completed
      'cancelled'          // Request was cancelled
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal'],
    required: true
  },
  paymentId: {
    type: String
  },
  completedAudio: {
    url: String,
    duration: Number,
    fileSize: Number,
    fileName: String
  },
  expectedDeliveryDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  audioFile: {
    type: String,
    required: false
  },
  reviewDeadline: {
    type: Date,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
  },
  revisionCount: {
    type: Number,
    default: 0,
    max: 2
  },
  disputeDetails: {
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'rejected'],
      default: 'pending'
    },
    resolution: String,
    resolvedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
audioRequestSchema.index({ creator: 1, status: 1 });
audioRequestSchema.index({ requester: 1, status: 1 });
audioRequestSchema.index({ requestDetails: 1, status: 1 });

// Update the updatedAt timestamp before saving
audioRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if review deadline has passed
audioRequestSchema.methods.isReviewDeadlinePassed = function() {
  if (!this.reviewDeadline) return false;
  return Date.now() > this.reviewDeadline;
};

// Method to check if request can be disputed
audioRequestSchema.methods.canBeDisputed = function() {
  return this.status === 'ready_for_review' && !this.isReviewDeadlinePassed();
};

// Method to check if request can be revised
audioRequestSchema.methods.canBeRevised = function() {
  return this.status === 'rejected' && this.revisionCount < 2;
};

const AudioRequest = mongoose.model('AudioRequest', audioRequestSchema);

module.exports = AudioRequest; 