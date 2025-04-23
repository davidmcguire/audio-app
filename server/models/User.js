const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for shoutout pricing options
const shoutoutOptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in seconds
    required: true,
    min: 5,
    max: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['standard', 'premium', 'custom'],
    default: 'standard'
  }
}, { _id: true });

// Define the schema for media links
const mediaLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['podcast', 'radio', 'social', 'website', 'other'],
    default: 'podcast'
  },
  icon: {
    type: String,
    default: 'link'
  }
}, { _id: true });

// Define the schema for pricing options
const pricingOptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryTime: {
    type: Number, // in days
    default: 7
  },
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['personal', 'business', 'custom'],
    default: 'personal'
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not using Google auth
    }
  },
  name: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String
  },
  isPodcaster: {
    type: Boolean,
    default: false
  },
  bio: String,
  profileImage: String,
  pricePerMessage: {
    type: Number,
    default: 0
  },
  availableForRequests: {
    type: Boolean,
    default: true
  },
  // New fields for enhanced profile
  displayName: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  profession: {
    type: String,
    trim: true
  },
  mediaLinks: [mediaLinkSchema],
  profileTheme: {
    type: String,
    enum: ['default', 'dark', 'light', 'colorful'],
    default: 'default'
  },
  customColors: {
    background: String,
    text: String,
    buttons: String
  },
  // Audio request pricing options
  pricingOptions: [pricingOptionSchema],
  acceptsRequests: {
    type: Boolean,
    default: false
  },
  requestsInfo: {
    headline: {
      type: String,
      trim: true,
      default: "Request a personalized audio message"
    },
    description: {
      type: String,
      trim: true
    },
    responseTime: {
      type: Number, // in days
      default: 7
    },
    paymentMethods: {
      paypal: {
        type: Boolean,
        default: false
      },
      stripe: {
        type: Boolean,
        default: false
      },
      paypalEmail: {
        type: String,
        trim: true
      },
      stripeAccountId: {
        type: String,
        trim: true
      }
    }
  },
  paymentSettings: {
    acceptsPayments: { type: Boolean, default: false },
    stripeAccountId: { type: String },
    paypalEmail: { type: String },
    preferredCurrency: { type: String, default: 'USD' }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  stripeAccountId: {
    type: String
  },
  stripeCustomerId: {
    type: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedRequests: {
    type: Number,
    default: 0
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    routingNumber: String,
    bankName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add password hashing middleware
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

// Add password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 