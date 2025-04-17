const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const Message = require('../models/Message');
const Request = require('../models/Request');

// Add auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Add /me endpoint
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      name,
      isAdmin: role === 'admin'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Regular login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get user's unread messages count
    const unreadMessages = await Message.countDocuments({
      recipient: user._id,
      read: false
    });

    // Get user's total earnings
    const totalEarnings = await Request.aggregate([
      {
        $match: {
          recipient: user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    // Get recent messages
    const recentMessages = await Message.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'name picture');

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        picture: user.picture
      },
      dashboard: {
        unreadMessages,
        totalEarnings: totalEarnings[0]?.total || 0,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/profile?token=${token}`);
  }
);

// Google OAuth route
router.post('/google', async (req, res) => {
  try {
    console.log('Google auth request received:', {
      hasAccessToken: !!req.body.accessToken,
      hasUserInfo: !!req.body.userInfo,
      userInfo: req.body.userInfo
    });

    const { accessToken, userInfo } = req.body;
    
    if (!userInfo) {
      console.error('No user info provided');
      throw new Error('No user info provided');
    }
    
    // Verify the access token by making a request to Google's userinfo endpoint
    console.log('Verifying access token with Google...');
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    console.log('Google userinfo response:', response.data);
    
    // Compare the user info from Google with what we received
    if (response.data.sub !== userInfo.sub) {
      console.error('User info mismatch:', {
        googleSub: response.data.sub,
        receivedSub: userInfo.sub
      });
      throw new Error('Invalid user info');
    }
    
    // Find or create user
    console.log('Finding or creating user...');
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      console.log('Creating new user...');
      user = await User.create({
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      });
    } else if (!user.googleId) {
      console.log('Updating existing user with Google ID...');
      // If user exists but doesn't have googleId (registered through email)
      user.googleId = userInfo.sub;
      user.picture = userInfo.picture;
      await user.save();
    }

    // Generate token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get user's unread messages count
    const unreadMessages = await Message.countDocuments({
      recipient: user._id,
      read: false
    });

    // Get user's total earnings
    const totalEarnings = await Request.aggregate([
      {
        $match: {
          recipient: user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    // Get recent messages
    const recentMessages = await Message.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'name picture');

    console.log('Authentication successful, sending response with dashboard data...');
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        picture: user.picture
      },
      dashboard: {
        unreadMessages,
        totalEarnings: totalEarnings[0]?.total || 0,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: 'Google authentication failed', 
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 