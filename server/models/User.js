const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPodcaster: { type: Boolean, default: false },
  bio: String,
  profileImage: String,
  pricePerMessage: { type: Number, default: 0 },
  availableForRequests: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema); 