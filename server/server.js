const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Request = require('./models/Request');

const app = express();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voicegram', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

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
app.post('/api/requests', upload.single('audio'), async (req, res) => {
  try {
    const { podcasterId, message, budget } = req.body;
    
    const newRequest = new Request({
      customer: req.user ? req.user._id : null, // Add proper user authentication
      podcaster: podcasterId,
      requestText: message,
      price: budget,
      audioUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Server error' });
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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 