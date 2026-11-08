const asyncWrapper = require('../../middleware/asyncWrapper');
const App = require('../../models/App');
const ErrorResponse = require('../../utils/ErrorResponse');
const { controlContainer } = require('./docker/containerControl');

// @desc      Stop the Docker container behind an app
// @route     POST /api/apps/:id/stop
// @access    Private (requires DOCKER_CONTROL=true)
const stopContainer = asyncWrapper(async (req, res, next) => {
  const app = await App.findOne({ where: { id: req.params.id } });

  if (!app?.containerName) {
    return next(
      new ErrorResponse(
        `App with the id of ${req.params.id} has no container to control`,
        404
      )
    );
  }

  const { containerName, state } = await controlContainer(
    app.containerName,
    'stop'
  );

  res.status(200).json({
    success: true,
    data: { appId: app.id, containerName, state },
  });
});

module.exports = stopContainer;
