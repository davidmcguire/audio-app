const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get pending and completed requests
    const [pendingRequests, completedRequests] = await Promise.all([
      Request.countDocuments({ podcaster: userId, status: 'pending' }),
      Request.countDocuments({ podcaster: userId, status: 'completed' })
    ]);

    // Calculate earnings
    const completedRequestsWithPrice = await Request.find({
      podcaster: userId,
      status: 'completed'
    }).select('price');

    const totalEarnings = completedRequestsWithPrice.reduce((sum, request) => sum + (request.price || 0), 0);
    const pendingRequestsWithPrice = await Request.find({
      podcaster: userId,
      status: 'pending'
    }).select('price');

    const pendingEarnings = pendingRequestsWithPrice.reduce((sum, request) => sum + (request.price || 0), 0);

    res.json({
      pendingRequests,
      completedRequests,
      totalEarnings,
      pendingEarnings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

module.exports = router; 