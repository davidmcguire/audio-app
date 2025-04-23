const User = require('../models/User');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update username
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    
    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bank details
const updateBankDetails = async (req, res) => {
  try {
    const { accountName, accountNumber, routingNumber, bankName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        bankDetails: {
          accountName,
          accountNumber,
          routingNumber,
          bankName
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateBankDetails
}; 