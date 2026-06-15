const { rateLimit } = require('express-rate-limit');
const ErrorResponse = require('../utils/ErrorResponse');

// Throttle login attempts to slow down brute-force guessing of the single
// shared password. Read routes are unaffected; this only guards POST /api/auth.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // max attempts per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) =>
    next(new ErrorResponse('Too many login attempts, try again later', 429)),
});

module.exports = loginRateLimit;
