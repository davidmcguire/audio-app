const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const ShoutoutRequest = require('../models/ShoutoutRequest');

// Get all shoutout requests for a personality
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await ShoutoutRequest.find({ personality: req.user._id })
      .populate('requester', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shoutout requests' });
  }
});

// Update shoutout request status
router.put('/requests/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ShoutoutRequest.findOne({
      _id: req.params.id,
      personality: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (status === 'completed') {
      request.completedAt = new Date();
    } else if (status === 'cancelled') {
      request.cancelledAt = new Date();
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status' });
  }
});

// Get all shoutout options for a personality
router.get('/options', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.shoutoutOptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shoutout options' });
  }
});

// Add a new shoutout option
router.post('/options', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.shoutoutOptions.push(req.body);
    await user.save();
    res.json(user.shoutoutOptions[user.shoutoutOptions.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding shoutout option' });
  }
});

// Update a shoutout option
router.put('/options/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const optionIndex = user.shoutoutOptions.findIndex(
      option => option._id.toString() === req.params.id
    );

    if (optionIndex === -1) {
      return res.status(404).json({ message: 'Option not found' });
    }

    user.shoutoutOptions[optionIndex] = {
      ...user.shoutoutOptions[optionIndex].toObject(),
      ...req.body
    };

    await user.save();
    res.json(user.shoutoutOptions[optionIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shoutout option' });
  }
});

// Delete a shoutout option
router.delete('/options/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.shoutoutOptions = user.shoutoutOptions.filter(
      option => option._id.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: 'Option deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shoutout option' });
  }
});

// Update personality settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { displayName, bio, acceptsShoutouts, paymentSettings } = req.body;
    const user = await User.findById(req.user._id);

    if (displayName) user.displayName = displayName;
    if (bio) user.bio = bio;
    if (acceptsShoutouts !== undefined) user.acceptsShoutouts = acceptsShoutouts;
    if (paymentSettings) user.paymentSettings = paymentSettings;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

module.exports = router; 