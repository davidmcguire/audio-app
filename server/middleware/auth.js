const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = function(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        return res.status(401).json({ message: 'Invalid authentication token' });
      }
      
      User.findById(decoded.userId).then(function(user) {
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        next();
      }).catch(function(err) {
        return res.status(401).json({ message: 'User lookup failed' });
      });
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const isAdmin = function(req, res, next) {
  auth(req, res, function() {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

module.exports = auth; // Export just the auth middleware as the default 