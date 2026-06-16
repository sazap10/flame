const { rateLimit } = require('express-rate-limit');
const ErrorResponse = require('../utils/ErrorResponse');

// Throttle login attempts to slow down brute-force guessing of the single
// shared password. Read routes are unaffected; this only guards POST /api/auth.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // max attempts per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Proxy trust is an explicit operator opt-in via TRUST_PROXY (see api.js),
  // so skip the library's permissive-trust-proxy guard.
  validate: { trustProxy: false },
  handler: (_req, _res, next) =>
    next(new ErrorResponse('Too many login attempts, try again later', 429)),
});

module.exports = loginRateLimit;
