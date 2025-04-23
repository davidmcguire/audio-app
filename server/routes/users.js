const express = require('express');
const router = express.Router();

// Test route
router.get('/test', function(req, res) {
  res.json({ message: 'Users API working' });
});

module.exports = router;
