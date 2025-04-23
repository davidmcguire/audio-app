const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');

// Create a new audio request
router.post('/', auth, function(req, res) {
  const { recipientId, message, price } = req.body;

  // Validate request data
  if (!recipientId || !message || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if recipient exists
  User.findById(recipientId).then(function(recipient) {
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create new request
    const request = new Request({
      requester: req.user._id,
      recipient: recipientId,
      message,
      price,
      status: 'pending'
    });

    request.save().then(function(savedRequest) {
      res.status(201).json(savedRequest);
    }).catch(function(err) {
      console.error('Error saving request:', err);
      res.status(500).json({ message: 'Error creating request' });
    });
  }).catch(function(err) {
    console.error('Error finding recipient:', err);
    res.status(500).json({ message: 'Error finding recipient' });
  });
});

// Get requests for the authenticated user (both sent and received)
router.get('/', auth, function(req, res) {
  Request.find({
    $or: [
      { requester: req.user._id },
      { recipient: req.user._id }
    ]
  })
  .populate('requester', 'name picture')
  .populate('recipient', 'name picture')
  .sort({ createdAt: -1 })
  .then(function(requests) {
    res.json(requests);
  }).catch(function(err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Error fetching requests' });
  });
});

// Update request status
router.put('/:id/:action', auth, function(req, res) {
  const { id, action } = req.params;
  const validActions = ['accepted', 'rejected'];

  if (!validActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  Request.findById(id).then(function(request) {
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    request.status = action;
    request.save().then(function(updatedRequest) {
      res.json(updatedRequest);
    }).catch(function(err) {
      console.error('Error saving updated request:', err);
      res.status(500).json({ message: 'Error updating request' });
    });
  }).catch(function(err) {
    console.error('Error finding request:', err);
    res.status(500).json({ message: 'Error finding request' });
  });
});

module.exports = router; 