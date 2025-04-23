const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendRequestInitiatedEmail(requester, creator, requestDetails) {
    const requesterSubject = 'Your Audio Request Has Been Initiated';
    const creatorSubject = 'New Audio Request Received';

    const requesterHtml = `
      <h2>Your Audio Request Has Been Initiated</h2>
      <p>Dear ${requester.name},</p>
      <p>Your audio request to ${creator.name} has been initiated.</p>
      <p>Request Details:</p>
      <ul>
        <li>Creator: ${creator.name}</li>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
    `;

    const creatorHtml = `
      <h2>New Audio Request</h2>
      <p>Dear ${creator.name},</p>
      <p>You have received a new request from ${requester.name}.</p>
      <p>Request Details:</p>
      <ul>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
    `;

    await Promise.all([
      this.sendEmail(requester.email, requesterSubject, requesterHtml),
      this.sendEmail(creator.email, creatorSubject, creatorHtml)
    ]);
  }

  async sendRequestAcceptedEmail(requester, creator, requestDetails) {
    const requesterSubject = 'Your Audio Request Has Been Accepted';
    const creatorSubject = 'Audio Request Accepted';

    const requesterHtml = `
      <h2>Request Accepted</h2>
      <p>Dear ${requester.name},</p>
      <p>${creator.name} has accepted your request.</p>
      <p>Details:</p>
      <ul>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Type: ${requestDetails.type}</li>
      </ul>
    `;

    const creatorHtml = `
      <h2>Request Accepted</h2>
      <p>Dear ${creator.name},</p>
      <p>You've accepted the request from ${requester.name}.</p>
      <p>Details:</p>
      <ul>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Type: ${requestDetails.type}</li>
      </ul>
    `;

    await Promise.all([
      this.sendEmail(requester.email, requesterSubject, requesterHtml),
      this.sendEmail(creator.email, creatorSubject, creatorHtml)
    ]);
  }

  async sendAdminNotification(type, data) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('Admin email not configured');
      return;
    }

    const templates = {
      dispute_resolved: {
        subject: 'Dispute Resolved',
        html: `<h2>Dispute Resolution</h2><p>Amount: $${data.amount}</p>`
      },
      payment_released: {
        subject: 'Payment Released',
        html: `<h2>Payment Released</h2><p>Amount: $${data.amount}</p>`
      },
      suspicious_activity: {
        subject: 'Suspicious Activity',
        html: `<h2>Alert</h2><p>Type: ${data.type}</p>`
      }
    };

    const template = templates[type];
    if (!template) {
      console.error(`No template found for: ${type}`);
      return;
    }

    await this.sendEmail(adminEmail, template.subject, template.html);
  }

  async sendDisputeResolutionEmail(dispute, resolution) {
    const { requester, creator, pricingDetails } = dispute;
    
    // Send to requester
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: requester.email,
      subject: 'Your Dispute Has Been Resolved',
      html: `
        <h2>Dispute Resolution Update</h2>
        <p>Your dispute has been resolved:</p>
        <ul>
          <li>Amount: $${pricingDetails.price}</li>
          <li>Resolution: ${resolution}</li>
        </ul>
      `
    });

    // Send to creator
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: creator.email,
      subject: 'Dispute Resolution Update',
      html: `
        <h2>Dispute Resolution Update</h2>
        <p>The dispute has been resolved:</p>
        <ul>
          <li>Amount: $${pricingDetails.price}</li>
          <li>Resolution: ${resolution}</li>
        </ul>
      `
    });
  }

  async sendDisputeRejectionEmail(dispute) {
    const { requester, creator, pricingDetails } = dispute;
    
    // Send to requester
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: requester.email,
      subject: 'Your Dispute Has Been Rejected',
      html: `
        <h2>Dispute Rejection Update</h2>
        <p>Your dispute has been rejected:</p>
        <ul>
          <li>Amount: $${pricingDetails.price}</li>
        </ul>
      `
    });

    // Send to creator
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: creator.email,
      subject: 'Dispute Rejection Update',
      html: `
        <h2>Dispute Rejection Update</h2>
        <p>The dispute has been rejected:</p>
        <ul>
          <li>Amount: $${pricingDetails.price}</li>
        </ul>
      `
    });
  }

  async sendAudioReadyForReviewEmail(requester, creator, requestDetails) {
    const requesterSubject = 'Audio Ready for Review';
    const creatorSubject = 'Audio Uploaded - Awaiting Review';

    const requesterHtml = `
      <h2>Audio Ready for Review</h2>
      <p>Dear ${requester.name},</p>
      <p>${creator.name} has uploaded the audio content for your request.</p>
      <p>Request Details:</p>
      <ul>
        <li>Creator: ${creator.name}</li>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
      <p>Please log in to review the audio within 48 hours. If no action is taken, the payment will be automatically released to the creator.</p>
    `;

    const creatorHtml = `
      <h2>Audio Uploaded - Awaiting Review</h2>
      <p>Dear ${creator.name},</p>
      <p>You have uploaded the audio content for ${requester.name}'s request.</p>
      <p>Request Details:</p>
      <ul>
        <li>Requester: ${requester.name}</li>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
      <p>The requester will review the audio within 48 hours.</p>
    `;

    await Promise.all([
      this.sendEmail(requester.email, requesterSubject, requesterHtml),
      this.sendEmail(creator.email, creatorSubject, creatorHtml)
    ]);
  }

  async sendPaymentReleasedEmail(requester, creator, requestDetails) {
    const requesterSubject = 'Payment Released to Creator';
    const creatorSubject = 'Payment Received for Audio Request';

    const requesterHtml = `
      <h2>Payment Released to Creator</h2>
      <p>Dear ${requester.name},</p>
      <p>The payment for your audio request has been released to ${creator.name}.</p>
      <p>Request Details:</p>
      <ul>
        <li>Creator: ${creator.name}</li>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
      <p>Thank you for using our platform!</p>
    `;

    const creatorHtml = `
      <h2>Payment Received</h2>
      <p>Dear ${creator.name},</p>
      <p>You have received the payment for the audio request from ${requester.name}.</p>
      <p>Request Details:</p>
      <ul>
        <li>Requester: ${requester.name}</li>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
      <p>Thank you for using our platform!</p>
    `;

    await Promise.all([
      this.sendEmail(requester.email, requesterSubject, requesterHtml),
      this.sendEmail(creator.email, creatorSubject, creatorHtml)
    ]);
  }

  async sendDisputeInitiatedEmail(requester, creator, requestDetails) {
    const requesterSubject = 'Dispute Initiated for Audio Request';
    const creatorSubject = 'Dispute Initiated for Your Audio';

    const requesterHtml = `
      <h2>Dispute Initiated</h2>
      <p>Dear ${requester.name},</p>
      <p>You have initiated a dispute for your audio request from ${creator.name}.</p>
      <p>Request Details:</p>
      <ul>
        <li>Creator: ${creator.name}</li>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
      <p>Our team will review the dispute and make a decision within 7 days.</p>
    `;

    const creatorHtml = `
      <h2>Dispute Initiated</h2>
      <p>Dear ${creator.name},</p>
      <p>A dispute has been initiated for your audio request from ${requester.name}.</p>
      <p>Request Details:</p>
      <ul>
        <li>Requester: ${requester.name}</li>
        <li>Amount: $${requestDetails.amount}</li>
        <li>Request Type: ${requestDetails.type}</li>
      </ul>
      <p>Our team will review the dispute and make a decision within 7 days.</p>
    `;

    await Promise.all([
      this.sendEmail(requester.email, requesterSubject, requesterHtml),
      this.sendEmail(creator.email, creatorSubject, creatorHtml)
    ]);
  }
}

module.exports = new EmailService(); 