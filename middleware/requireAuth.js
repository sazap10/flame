const ErrorResponse = require('../utils/ErrorResponse');

const requireAuth = (req, _res, next) => {
  if (!req.isAuthenticated) {
    return next(new ErrorResponse('Unauthorized', 401));
  }

  next();
};

module.exports = requireAuth;
