const Request = require('../models/Request');

// Get all requests for the current user
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ podcaster: req.user.id })
      .populate('requester', 'name picture')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, action } = req.params;
    
    // Validate action
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const request = await Request.findOne({
      _id: requestId,
      podcaster: req.user.id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = action;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRequests,
  updateRequestStatus
}; 