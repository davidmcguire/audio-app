require('dotenv').config();

// Debug logging for environment variables
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  STRIPE_KEY_LOADED: !!process.env.STRIPE_SECRET_KEY,
  PAYPAL_ID_LOADED: !!process.env.PAYPAL_CLIENT_ID,
  CLIENT_URL: process.env.CLIENT_URL
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const securityMiddleware = require('./middleware/security');
const { apiLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize Stripe with the API key from environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize PayPal
const paypal = require('@paypal/checkout-server-sdk');
let paypalEnvironment;
if (process.env.NODE_ENV === 'production') {
  paypalEnvironment = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID || 'test',
    process.env.PAYPAL_CLIENT_SECRET || 'test'
  );
} else {
  paypalEnvironment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID || 'test',
    process.env.PAYPAL_CLIENT_SECRET || 'test'
  );
}
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// Import models and routes
const User = require('./models/User');
const Request = require('./models/Request');
const Recording = require('./models/Recording');
const Message = require('./models/Message');
const AudioRequest = require('./models/AudioRequest');
const userRoutes = require('./routes/users');
const requestsRouter = require('./routes/requests');
const messageRoutes = require('./routes/messages');
const audioRequestsRouter = require('./routes/audioRequests');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const paymentAutoReleaseJob = require('./jobs/paymentAutoRelease');
const shoutoutsRoutes = require('./routes/shoutouts');

const app = express();

// Apply security middleware
app.use(securityMiddleware);

// Apply rate limiting
// app.use('/api/', apiLimiter);
// app.use('/api/auth/', authLimiter);
// app.use('/api/payments/', paymentLimiter);

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = file.mimetype.startsWith('audio/') ? 'uploads/audio/' : 'uploads/artwork/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio' && file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else if (file.fieldname === 'artwork' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Ensure uploads directories exist
if (!fs.existsSync('uploads/audio')) {
  fs.mkdirSync('uploads/audio', { recursive: true });
}
if (!fs.existsSync('uploads/artwork')) {
  fs.mkdirSync('uploads/artwork', { recursive: true });
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5001',
      'httsp://fanswoon.com',
      'https://js.stripe.com',
      'https://m.stripe.network',
      'https://accounts.google.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      callback(null, true); // Allow all origins for now to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Add cookie parser middleware
app.use(cookieParser());

// Remove the conflicting security headers middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestsRouter);
app.use('/api/messages', messageRoutes);
app.use('/api/audio-requests', audioRequestsRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shoutouts', shoutoutsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test route working',
    env: {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasPaypalId: !!process.env.PAYPAL_CLIENT_ID,
      hasPaypalSecret: !!process.env.PAYPAL_CLIENT_SECRET,
      clientUrl: process.env.CLIENT_URL
    }
  });
});

const port = parseInt(process.env.PORT) || 5001;

// Try to connect to MongoDB but start server even if connection fails
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Start the payment auto-release job if MongoDB is connected
    paymentAutoReleaseJob.start();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Starting server without MongoDB connection...');
  })
  .finally(() => {
    // Start the server regardless of MongoDB connection status
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
      console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
    });
  });

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    if (!req.header('Authorization')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = req.header('Authorization').replace('Bearer ', '');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_key_for_authentication';
    
    console.log('Authenticating with JWT_SECRET:', JWT_SECRET.substring(0, 3) + '...');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error('User not found');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, email, and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered',
        message: 'This email address is already registered'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret'
    );
    
    // Return user data (excluding password) and token
    const userData = user.toObject();
    delete userData.password;
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: userData, 
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
});

// API Routes
app.get('/api/podcasters', async (req, res) => {
  try {
    const podcasters = await User.find({ isPodcaster: true });
    res.json(podcasters);
  } catch (error) {
    console.error('Error fetching podcasters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new request with audio upload
app.post('/api/requests', auth, upload.single('audio'), async (req, res) => {
  try {
    const { recipientId, details, price } = req.body;
    
    // Create new request
    const newRequest = new Request({
      sender: req.user._id,
      recipient: recipientId,
      details,
      price,
      status: 'pending',
      audioUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    await newRequest.save();

    // Create inbox message for recipient
    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      type: 'AUDIO_REQUEST',
      content: details,
      requestDetails: {
        price: price,
        status: 'PENDING'
      }
    });

    await message.save();
    
    res.status(201).json({ request: newRequest, message });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Get requests for a podcaster
app.get('/api/podcaster/requests/:podcasterId', async (req, res) => {
  try {
    const requests = await Request.find({ 
      podcaster: req.params.podcasterId 
    }).populate('customer', 'name email');
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get requests for a customer
app.get('/api/customer/requests/:customerId', async (req, res) => {
  try {
    const requests = await Request.find({ 
      customer: req.params.customerId 
    }).populate('podcaster', 'name email');
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Recording routes
app.post('/api/recordings', auth, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'artwork', maxCount: 1 }
]), async (req, res) => {
  try {
    const recording = new Recording({
      title: req.body.title,
      description: req.body.description,
      url: '/uploads/audio/' + req.files.audio[0].filename,
      artworkUrl: req.files.artwork ? '/uploads/artwork/' + req.files.artwork[0].filename : null,
      user: req.user._id
    });
    await recording.save();
    res.status(201).send(recording);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/recordings', auth, async (req, res) => {
  try {
    const recordings = await Recording.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.send(recordings);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/api/recordings/:id', auth, async (req, res) => {
  try {
    const recording = await Recording.findOne({ _id: req.params.id, user: req.user._id });
    if (!recording) {
      return res.status(404).send();
    }
    
    if (req.body.description !== undefined) {
      recording.description = req.body.description;
    }
    
    await recording.save();
    res.send(recording);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete('/api/recordings/:id', auth, async (req, res) => {
  try {
    const recording = await Recording.findOne({ _id: req.params.id, user: req.user._id });
    if (!recording) {
      return res.status(404).send();
    }

    // Delete the audio file
    const filePath = path.join(__dirname, recording.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await recording.remove();
    res.send(recording);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Function to check if ffmpeg is installed
const isFfmpegInstalled = async () => {
  try {
    await execPromise('which ffmpeg');
    return true;
  } catch (error) {
    console.log('ffmpeg is not installed');
    return false;
  }
};

// Function to compress audio file
const compressAudio = async (inputPath, outputPath) => {
  try {
    // Check if ffmpeg is installed
    const ffmpegInstalled = await isFfmpegInstalled();
    
    if (!ffmpegInstalled) {
      console.log('ffmpeg not installed, skipping compression');
      // If ffmpeg is not installed, just copy the file instead
      fs.copyFileSync(inputPath, outputPath);
      return {
        compressed: false,
        message: 'Audio copied without compression (ffmpeg not available)'
      };
    }
    
    // Using ffmpeg to compress the audio file
    // -ab 64k sets the bitrate to 64kbps which reduces file size
    await execPromise(`ffmpeg -i ${inputPath} -ab 64k ${outputPath}`);
    console.log(`Audio compressed: ${outputPath}`);
    return {
      compressed: true,
      message: 'Audio compressed successfully'
    };
  } catch (error) {
    console.error('Error compressing audio:', error);
    // If compression fails, just copy the file
    try {
      fs.copyFileSync(inputPath, outputPath);
      return {
        compressed: false,
        message: 'Audio copied without compression (compression failed)'
      };
    } catch (copyError) {
      console.error('Error copying file:', copyError);
      return {
        compressed: false,
        message: 'Failed to process audio file',
        error: copyError.message
      };
    }
  }
};

// Function to send an email with audio attachment
const sendEmailWithAudio = async (email, audioUrl, title, userName) => {
  try {
    console.log(`Attempting to send email to ${email} for audio: ${title}`);
    
    // Create a test account if no email configuration is provided
    // For production, you should use environment variables for these credentials
    let transporter;
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use configured email service
      console.log(`Using configured email service: ${process.env.EMAIL_SERVICE}`);
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // For development, use Ethereal (fake SMTP service for testing)
      console.log('No email credentials found, using Ethereal test account');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('Using test email account:', testAccount.user);
    }
    
    // Full URL for the audio file
    const fullAudioUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/play?url=${encodeURIComponent(audioUrl)}`;
    console.log('Audio URL for email:', fullAudioUrl);
    
    // Prepare the email
    const mailOptions = {
      from: '"fanswoon" <noreply@fanswoon.com>',
      to: email,
      subject: 'fanswoon - New Audio Shared With You',
      text: `Hello,\n\n${userName} has shared an audio recording with you: "${title}"\n\nYou can listen to it here: ${fullAudioUrl}\n\nBest regards,\nThe fanswoon Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Audio Shared With You</h2>
          <p>${userName} has shared an audio recording with you: <strong>"${title}"</strong></p>
          <p>You can listen to it by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${fullAudioUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Listen Now
            </a>
          </div>
          <p>Best regards,<br>The fanswoon Team</p>
        </div>
      `
    };
    
    // Send the email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    // For test accounts, show the preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', previewUrl);
      console.log('IMPORTANT: Open this URL to view the test email (it was not actually delivered)');
    }
    
    return {
      success: true,
      message: `Email sent to ${email}`,
      sentAt: new Date().toISOString(),
      messageId: info.messageId,
      previewUrl: info.messageId && info.messageId.includes('ethereal') ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Check for common email errors
    let errorMessage = `Failed to send email to ${email}`;
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your email credentials.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Network error. Check your internet connection.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid recipient email address.';
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code
    };
  }
};

// Error handler for multer
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error('Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        message: 'File too large. Maximum size is 50MB.',
        error: err.message
      });
    }
    return res.status(400).json({ 
      message: 'File upload error',
      error: err.message
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Upload error:', err.message);
    return res.status(500).json({ 
      message: 'Server error during file upload',
      error: err.message
    });
  }
  // If no error, continue
  next();
};

// Add this route after other recording routes
app.post('/api/recordings/upload', auth, upload.single('audio'), uploadErrorHandler, async (req, res) => {
  try {
    console.log('Upload request received from user:', req.user._id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('File details:', req.file ? {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'No file');
    
    if (!req.file) {
      console.log('Error: No audio file provided in the request');
      return res.status(400).json({ message: 'No audio file provided' });
    }

    // Check if uploads directory exists
    const audioDir = path.join(__dirname, 'uploads/audio');
    if (!fs.existsSync(audioDir)) {
      console.log(`Creating audio uploads directory: ${audioDir}`);
      fs.mkdirSync(audioDir, { recursive: true });
    }

    console.log('Creating new recording document');
    const recording = new Recording({
      title: req.body.title || 'Untitled Recording',
      description: req.body.description || '',
      url: `/uploads/audio/${req.file.filename}`,
      user: req.user._id,
      isPublic: true // Default to public
    });

    console.log('Saving recording to database');
    await recording.save();
    console.log('Recording saved:', recording._id);

    // Response object to track sharing status
    const responseData = {
      recording: {
        _id: recording._id,
        title: recording.title,
        description: recording.description,
        url: recording.url
      },
      sharingStatus: null
    };

    // Handle sharing if shareWith is provided
    if (req.body.shareWith) {
      const shareType = req.body.shareType || 'email';
      const shareWith = req.body.shareWith;
      console.log(`Sharing with ${shareWith} via ${shareType}`);

      try {
        if (shareType === 'email') {
          console.log('Processing email sharing request');
          
          // Process the audio for email sharing
          const originalFilePath = path.join(__dirname, 'uploads/audio', req.file.filename);
          const compressedFileName = `email-${req.file.filename}`;
          const compressedFilePath = path.join(__dirname, 'uploads/audio', compressedFileName);
          
          console.log('Original file path:', originalFilePath);
          console.log('Compressed file path:', compressedFilePath);
          
          // Check if original file exists
          if (!fs.existsSync(originalFilePath)) {
            console.log('Error: Original audio file not found at', originalFilePath);
            throw new Error('Original audio file not found');
          }
          
          // Check if ffmpeg is installed for compression
          const ffmpegInstalled = await isFfmpegInstalled();
          let compressionResult;
          
          if (ffmpegInstalled) {
            console.log('Compressing audio for email...');
            compressionResult = await compressAudio(originalFilePath, compressedFilePath);
          } else {
            console.log('FFmpeg not installed, skipping compression');
            compressionResult = { 
              compressed: false, 
              message: 'Audio compression skipped (FFmpeg not available)' 
            };
            // Just copy the file instead
            console.log('Copying file instead of compressing');
            fs.copyFileSync(originalFilePath, compressedFilePath);
          }
          
          // Check if compressed file exists
          if (!fs.existsSync(compressedFilePath)) {
            console.log('Error: Compressed audio file not created at', compressedFilePath);
            throw new Error('Failed to create compressed audio file');
          }
          
          // Create a record for the email version
          console.log('Creating email version recording document');
          const emailRecording = new Recording({
            title: `${recording.title} (Email Version)`,
            description: recording.description,
            url: `/uploads/audio/${compressedFileName}`,
            user: req.user._id,
            originalRecording: recording._id,
            isCompressed: compressionResult.compressed,
            isPublic: true
          });
          
          console.log('Saving email version recording to database');
          await emailRecording.save();
          console.log('Email version recording saved:', emailRecording._id);
          
          // Send the email
          console.log('Sending email with audio link...');
          const emailResult = await sendEmailWithAudio(
            shareWith, 
            emailRecording.url, 
            recording.title, // Use original title without "(Email Version)"
            req.user.name
          );
          
          if (emailResult.success) {
            console.log('Email sent successfully');
          } else {
            console.log('Email sending failed:', emailResult.message);
          }
          
          responseData.sharingStatus = {
            success: emailResult.success,
            method: 'email',
            recipient: shareWith,
            compressionStatus: compressionResult.message,
            emailStatus: emailResult.message,
            emailRecordingId: emailRecording._id
          };
          
          // If using Ethereal for testing, include the preview URL
          if (emailResult.previewUrl) {
            console.log('Email preview URL:', emailResult.previewUrl);
            responseData.sharingStatus.previewUrl = emailResult.previewUrl;
          }
        } else if (shareType === 'user') {
          // Find the user by email or name
          const recipient = await User.findOne({
            $or: [
              { email: shareWith },
              { name: shareWith }
            ]
          });

          if (recipient) {
            console.log(`Found recipient: ${recipient.name}`);
            // Create a shared recording for the recipient (uncompressed)
            const sharedRecording = new Recording({
              title: `${recording.title} (shared by ${req.user.name})`,
              description: recording.description,
              url: recording.url,
              artworkUrl: recording.artworkUrl,
              user: recipient._id,
              originalRecording: recording._id,
              isShared: true
            });

            await sharedRecording.save();
            console.log('Shared recording saved:', sharedRecording._id);

            // Create a message to notify the recipient
            const message = new Message({
              sender: req.user._id,
              recipient: recipient._id,
              type: 'recording_share',
              content: `${req.user.name} shared a recording with you: "${recording.title}"`,
              recording: sharedRecording._id,
              read: false
            });

            await message.save();
            console.log('Notification message saved');
            
            responseData.sharingStatus = {
              success: true,
              method: 'user',
              recipient: recipient.name,
              recipientId: recipient._id,
              sharedRecordingId: sharedRecording._id
            };
          } else {
            console.log(`Recipient not found: ${shareWith}`);
            responseData.sharingStatus = {
              success: false,
              method: 'user',
              recipient: shareWith,
              error: 'Recipient user not found'
            };
          }
        }
      } catch (sharingError) {
        console.error('Error during sharing:', sharingError);
        responseData.sharingStatus = {
          success: false,
          method: shareType,
          recipient: shareWith,
          error: sharingError.message || 'Error processing sharing request'
        };
      }
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Upload error:', error);
    
    // If a file was uploaded but an error occurred later, try to clean up
    if (req.file) {
      try {
        const filePath = path.join(__dirname, 'uploads/audio', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up file: ${req.file.filename}`);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ message: error.message || 'Error uploading audio' });
  }
});

// Update recording with artwork
app.patch('/api/recordings/:id/artwork', auth, upload.single('artwork'), async (req, res) => {
  try {
    const recording = await Recording.findOne({ _id: req.params.id, user: req.user._id });
    if (!recording) {
      return res.status(404).send();
    }

    // Delete old artwork if it exists
    if (recording.artworkUrl) {
      const oldArtworkPath = path.join(__dirname, recording.artworkUrl);
      if (fs.existsSync(oldArtworkPath)) {
        fs.unlinkSync(oldArtworkPath);
      }
    }

    recording.artworkUrl = '/uploads/artwork/' + req.file.filename;
    await recording.save();
    res.send(recording);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add this route after other recording routes
app.post('/api/recordings/:id/share', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const recordingId = req.params.id;

    // Verify the recording exists and belongs to the sender
    const recording = await Recording.findOne({ _id: recordingId, user: req.user._id });
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Verify the recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create a new recording for the recipient
    const sharedRecording = new Recording({
      title: `${recording.title} (shared by ${req.user.name})`,
      description: recording.description,
      url: recording.url,
      artworkUrl: recording.artworkUrl,
      user: recipientId,
      originalRecording: recording._id
    });

    await sharedRecording.save();
    res.status(200).json({ message: 'Recording shared successfully' });
  } catch (error) {
    console.error('Error sharing recording:', error);
    res.status(500).json({ message: 'Error sharing recording' });
  }
});

// Get recordings by user ID (public recordings only)
app.get('/api/recordings/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find recordings that belong to the specified user and are public
    const recordings = await Recording.find({ 
      user: userId,
      isPublic: true 
    })
    .sort({ createdAt: -1 });
    
    res.json(recordings);
  } catch (err) {
    console.error('Error fetching user recordings:', err);
    res.status(500).json({ message: 'Error fetching user recordings' });
  }
});

const generateRssFeed = (recordings, baseUrl) => {
  const feedItems = recordings.map(recording => {
    const audioUrl = `${baseUrl}${recording.url}`;
    return `
      <item>
        <title>${recording.title}</title>
        <description>${recording.description || ''}</description>
        <pubDate>${new Date(recording.createdAt).toUTCString()}</pubDate>
        <enclosure url="${audioUrl}" type="audio/mpeg" />
        <guid isPermaLink="true">${audioUrl}</guid>
      </item>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
      <channel>
        <title>My Audio Recordings</title>
        <link>${baseUrl}</link>
        <description>My personal audio recordings feed</description>
        <language>en-us</language>
        ${feedItems}
      </channel>
    </rss>
  `;
};

// RSS feed endpoint
app.get('/api/recordings/rss/:userId', async (req, res) => {
  try {
    const recordings = await Recording.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const rssFeed = generateRssFeed(recordings, baseUrl);

    res.set('Content-Type', 'application/xml');
    res.send(rssFeed);
  } catch (error) {
    console.error('RSS feed error:', error);
    res.status(500).json({ message: 'Error generating RSS feed' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
} else {
  // In development, still serve the frontend but only for non-API routes
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Add a mock login route that works without MongoDB
app.post('/api/auth/login-mock', (req, res) => {
  const mockUser = {
    _id: "mockuser123",
    name: "Test User",
    email: "test@example.com",
    isAdmin: true,
    picture: "https://via.placeholder.com/150"
  };

  const token = jwt.sign(
    { userId: mockUser._id },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: mockUser,
    dashboard: {
      unreadMessages: 0,
      totalEarnings: 0,
      recentMessages: []
    }
  });
});

// Add a mock route for Google login
app.post('/api/auth/google', (req, res) => {
  const mockUser = {
    _id: "mockuser456",
    name: "Google User",
    email: "google@example.com",
    isAdmin: false,
    picture: "https://via.placeholder.com/150"
  };

  const token = jwt.sign(
    { userId: mockUser._id },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: mockUser
  });
});