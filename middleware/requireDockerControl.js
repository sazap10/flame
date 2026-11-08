const ErrorResponse = require('../utils/ErrorResponse');
const { isControlEnabled } = require('../controllers/apps/docker/dockerApi');

// Feature gate for container start/stop: the control routes only exist when
// the operator opted in with DOCKER_CONTROL=true. Placed after `requireAuth`
// so unauthenticated callers can't probe whether the feature is enabled.
const requireDockerControl = (_req, _res, next) => {
  if (!isControlEnabled()) {
    return next(new ErrorResponse('Docker control is not enabled', 404));
  }

  next();
};

module.exports = requireDockerControl;
