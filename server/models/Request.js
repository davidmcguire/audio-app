const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  podcaster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestText: { type: String, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'rejected'],
    default: 'pending'
  },
  audioUrl: String,
  responseAudioUrl: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('Request', requestSchema); 