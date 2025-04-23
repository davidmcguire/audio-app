const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRequests,
  updateRequestStatus
} = require('../controllers/requestController');

// Get all requests for the current user
router.get('/', protect, getRequests);

// Update request status (accept/reject)
router.put('/:requestId/:action', protect, updateRequestStatus);

module.exports = router; 