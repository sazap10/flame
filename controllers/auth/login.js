const { createHash, timingSafeEqual } = require('node:crypto');
const asyncWrapper = require('../../middleware/asyncWrapper');
const ErrorResponse = require('../../utils/ErrorResponse');
const signToken = require('../../utils/signToken');

// Hash both values to fixed-length digests so timingSafeEqual gets equal-length
// buffers (it throws otherwise) and the comparison doesn't leak the password
// length through timing.
const digest = (value) => createHash('sha256').update(String(value)).digest();

// @desc      Login user
// @route     POST /api/auth/
// @access    Public
const login = asyncWrapper(async (req, res, next) => {
  const { password, duration } = req.body;

  // Fail closed if no server password is configured, otherwise a submitted
  // value that hashes to the digest of an empty/undefined password could log in.
  if (!process.env.PASSWORD) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isMatch = timingSafeEqual(
    digest(process.env.PASSWORD),
    digest(password)
  );

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const token = signToken(duration);

  res.status(200).json({
    success: true,
    data: { token },
  });
});

module.exports = login;
