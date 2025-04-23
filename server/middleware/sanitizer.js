const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');

// XSS sanitizer middleware
const xssSanitizer = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    });
  }

  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    });
  }

  next();
};

// MongoDB sanitizer middleware
const mongoSanitizer = mongoSanitize({
  replaceWith: '_',
  allowDots: true,
  onSanitize: ({ req, key }) => {
    console.warn(`This request[${key}] contained data that was sanitized`);
  }
});

module.exports = {
  xssSanitizer,
  mongoSanitizer
}; 