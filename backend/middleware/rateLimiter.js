const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for public form submissions (contact/quote routes).
 * Limits each IP address to 5 requests per 15-minute window.
 */
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 submissions per windowMs
  standardHeaders: true, // Return rate limit info in standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many submissions. Please try again later.'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

module.exports = contactRateLimiter;
