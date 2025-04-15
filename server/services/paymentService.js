const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('./emailService');

const paymentService = {
  // Initialize payment and hold funds
  async initializePayment(requester, creator, amount, requestDetails) {
    try {
      // Create a payment intent with manual capture
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        capture_method: 'manual',
        metadata: {
          requesterId: requester._id.toString(),
          creatorId: creator._id.toString(),
          requestId: requestDetails._id.toString()
        }
      });

      // Send email notifications
      await emailService.sendRequestInitiatedEmail(requester, creator, requestDetails);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  },

  // Capture payment after approval
  async capturePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw error;
    }
  },

  // Release payment to creator
  async releasePaymentToCreator(paymentIntentId, requester, creator, requestDetails) {
    try {
      // Capture the payment
      const paymentIntent = await this.capturePayment(paymentIntentId);

      // Transfer funds to creator's connected account
      const transfer = await stripe.transfers.create({
        amount: paymentIntent.amount - paymentIntent.application_fee_amount,
        currency: 'usd',
        destination: creator.stripeAccountId,
        transfer_group: paymentIntentId
      });

      // Send email notifications
      await emailService.sendPaymentReleasedEmail(requester, creator, requestDetails);

      return {
        paymentIntent,
        transfer
      };
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw error;
    }
  },

  // Cancel payment authorization
  async cancelPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  },

  // Handle dispute
  async handleDispute(paymentIntentId, requester, creator, requestDetails) {
    try {
      // Send dispute notifications
      await emailService.sendDisputeInitiatedEmail(requester, creator, requestDetails);

      // The actual dispute handling will be done through Stripe's dashboard
      // This function just logs the dispute and notifies users
      return {
        status: 'dispute_initiated',
        paymentIntentId
      };
    } catch (error) {
      console.error('Error handling dispute:', error);
      throw error;
    }
  },

  // Auto-release payment after 48 hours if no action taken
  async autoReleasePayment(paymentIntentId, requester, creator, requestDetails) {
    try {
      const result = await this.releasePaymentToCreator(
        paymentIntentId,
        requester,
        creator,
        requestDetails
      );

      // Send additional notification about auto-release
      await emailService.sendEmail(
        requester.email,
        'Payment Auto-Released',
        `The payment for your request has been automatically released to ${creator.name} as no action was taken within 48 hours.`
      );

      return result;
    } catch (error) {
      console.error('Error auto-releasing payment:', error);
      throw error;
    }
  }
};

module.exports = paymentService; 