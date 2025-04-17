const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');

// Create a new audio request
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, message, price } = req.body;

    // Validate request data
    if (!recipientId || !message || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
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

    await request.save();

    res.status(201).json(request);
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Get requests for the authenticated user (both sent and received)
router.get('/', auth, async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .populate('requester', 'name picture')
    .populate('recipient', 'name picture')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Update request status
router.put('/:id/:action', auth, async (req, res) => {
  try {
    const { id, action } = req.params;
    const validActions = ['accepted', 'rejected'];

    if (!validActions.includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    request.status = action;
    await request.save();

    res.json(request);
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ message: 'Error updating request' });
  }
});

module.exports = router; 