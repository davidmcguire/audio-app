const mongoose = require('mongoose');

const pricingOptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['personal', 'business'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1
  },
  features: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    enum: ['shoutout', 'custom-episode', 'exclusive-content', 'personal-message'],
    required: true
  },
  maxDuration: {
    type: Number, // in minutes
    required: function() {
      return this.category === 'custom-episode';
    }
  },
  customizationOptions: [{
    name: String,
    description: String,
    price: Number
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
pricingOptionSchema.index({ creator: 1, category: 1 });
pricingOptionSchema.index({ type: 1, category: 1 });

const PricingOption = mongoose.model('PricingOption', pricingOptionSchema);

module.exports = PricingOption; 