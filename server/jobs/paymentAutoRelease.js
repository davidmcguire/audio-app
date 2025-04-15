const cron = require('node-cron');
const AudioRequest = require('../models/AudioRequest');
const paymentService = require('../services/paymentService');

// Run every hour
const schedule = '0 * * * *';

const paymentAutoReleaseJob = cron.schedule(schedule, async () => {
  try {
    // Find all requests that are ready for review and past the deadline
    const requests = await AudioRequest.find({
      status: 'ready_for_review',
      reviewDeadline: { $lt: new Date() }
    }).populate('requester creator');

    for (const request of requests) {
      try {
        // Auto-release payment
        await paymentService.autoReleasePayment(
          request.paymentIntentId,
          request.requester,
          request.creator,
          request
        );

        // Update request status
        request.status = 'completed';
        await request.save();

        console.log(`Auto-released payment for request ${request._id}`);
      } catch (error) {
        console.error(`Error auto-releasing payment for request ${request._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in payment auto-release job:', error);
  }
});

module.exports = paymentAutoReleaseJob; 