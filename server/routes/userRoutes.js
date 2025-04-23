const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  updateProfile,
  updateBankDetails,
  getProfile
} = require('../controllers/userController');

// Get user profile
router.get('/profile', protect, getProfile);

// Update username
router.put('/profile', protect, updateProfile);

// Update bank details
router.put('/bank-details', protect, updateBankDetails);

module.exports = router; 