const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Payment = require('../models/Payment');
const AudioRequest = require('../models/AudioRequest');
const User = require('../models/User');
const Request = require('../models/Request');
const emailService = require('../services/emailService');
const paymentService = require('../services/paymentService');

// Define isAdmin middleware locally instead of importing it
const isAdmin = function(req, res, next) {
  auth(req, res, function() {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

// Get platform revenue statistics
router.get('/revenue', [auth, isAdmin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get total platform revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed', ...query } },
      { $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPlatformFee: { $sum: '$platformFee' },
        totalCreatorAmount: { $sum: '$creatorAmount' },
        count: { $sum: 1 }
      }}
    ]);
    
    // Get revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: { status: 'completed', ...query } },
      { $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        totalPlatformFee: { $sum: '$platformFee' },
        count: { $sum: 1 }
      }}
    ]);
    
    // Get daily revenue for the period
    const dailyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', ...query } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalAmount: { $sum: '$amount' },
        totalPlatformFee: { $sum: '$platformFee' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalRevenue: totalRevenue[0] || { totalAmount: 0, totalPlatformFee: 0, totalCreatorAmount: 0, count: 0 },
      revenueByMethod,
      dailyRevenue
    });
  } catch (error) {
    console.error('Error fetching revenue statistics:', error);
    res.status(500).json({ message: 'Failed to fetch revenue statistics' });
  }
});

// Get admin dashboard statistics
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    const [
      totalDisputes,
      pendingDisputes,
      totalRequests,
      totalRevenue
    ] = await Promise.all([
      AudioRequest.countDocuments({ 'disputeDetails.status': { $exists: true } }),
      AudioRequest.countDocuments({ 'disputeDetails.status': 'pending' }),
      AudioRequest.countDocuments(),
      AudioRequest.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricingDetails.price' } } }
      ])
    ]);

    res.json({
      totalDisputes,
      pendingDisputes,
      totalRequests,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin statistics' });
  }
});

// Get all disputes
router.get('/disputes', [auth, isAdmin], async (req, res) => {
  try {
    const disputes = await AudioRequest.find({
      'disputeDetails.status': { $exists: true }
    })
    .populate('requester', 'name email')
    .populate('creator', 'name email')
    .sort({ 'disputeDetails.createdAt': -1 });

    res.json(disputes);
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ message: 'Error fetching disputes' });
  }
});

// Resolve a dispute
router.post('/disputes/:disputeId/resolve', [auth, isAdmin], async (req, res) => {
  try {
    const { resolution } = req.body;
    const dispute = await AudioRequest.findById(req.params.disputeId)
      .populate('requester', 'name email')
      .populate('creator', 'name email');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (dispute.disputeDetails.status !== 'pending') {
      return res.status(400).json({ message: 'Dispute is not pending resolution' });
    }

    // Update dispute status and resolution
    dispute.disputeDetails.status = 'resolved';
    dispute.disputeDetails.resolution = resolution;
    dispute.disputeDetails.resolvedAt = new Date();
    dispute.status = 'completed';

    await dispute.save();

    // Release payment to creator
    await paymentService.releasePaymentToCreator(
      dispute.paymentIntentId,
      dispute.requester,
      dispute.creator,
      dispute
    );

    // Send email notifications
    await Promise.all([
      emailService.sendAdminNotification('dispute_resolved', {
        disputeId: dispute._id,
        requesterName: dispute.requester.name,
        creatorName: dispute.creator.name,
        amount: dispute.pricingDetails.price,
        resolution
      }),
      emailService.sendDisputeResolutionEmail(dispute, resolution)
    ]);

    res.json({ message: 'Dispute resolved successfully' });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ message: 'Error resolving dispute' });
  }
});

// Reject a dispute
router.post('/disputes/:disputeId/reject', [auth, isAdmin], async (req, res) => {
  try {
    const dispute = await AudioRequest.findById(req.params.disputeId)
      .populate('requester', 'name email')
      .populate('creator', 'name email');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (dispute.disputeDetails.status !== 'pending') {
      return res.status(400).json({ message: 'Dispute is not pending resolution' });
    }

    // Update dispute status
    dispute.disputeDetails.status = 'rejected';
    dispute.disputeDetails.resolvedAt = new Date();
    dispute.status = 'completed';

    await dispute.save();

    // Release payment to creator
    await paymentService.releasePaymentToCreator(
      dispute.paymentIntentId,
      dispute.requester,
      dispute.creator,
      dispute
    );

    // Send email notifications
    await Promise.all([
      emailService.sendAdminNotification('dispute_rejected', {
        disputeId: dispute._id,
        requesterName: dispute.requester.name,
        creatorName: dispute.creator.name,
        amount: dispute.pricingDetails.price
      }),
      emailService.sendDisputeRejectionEmail(dispute)
    ]);

    res.json({ message: 'Dispute rejected successfully' });
  } catch (error) {
    console.error('Error rejecting dispute:', error);
    res.status(500).json({ message: 'Error rejecting dispute' });
  }
});

// Add new route for suspicious activity monitoring
router.post('/monitor/suspicious-activity', [auth, isAdmin], async (req, res) => {
  try {
    const { type, userId, details, ipAddress } = req.body;
    
    // Send notification to admin
    await emailService.sendAdminNotification('suspicious_activity', {
      type,
      userName: userId,
      details,
      ipAddress
    });

    res.json({ message: 'Suspicious activity reported successfully' });
  } catch (error) {
    console.error('Error reporting suspicious activity:', error);
    res.status(500).json({ message: 'Error reporting suspicious activity' });
  }
});

module.exports = router; 