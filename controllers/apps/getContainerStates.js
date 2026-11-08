const asyncWrapper = require('../../middleware/asyncWrapper');
const App = require('../../models/App');
const { listContainerStates } = require('./docker/containerControl');

// @desc      Get Docker container state for every controllable app
// @route     GET /api/apps/containers
// @access    Private (requires DOCKER_CONTROL=true)
const getContainerStates = asyncWrapper(async (_req, res, _next) => {
  const apps = await App.findAll({
    where: { dockerControl: true },
    order: [['id', 'ASC']],
  });

  // Skip the Docker call entirely when nothing is controllable.
  const states = apps.length ? await listContainerStates() : new Map();

  const data = apps
    .filter((app) => app.containerName)
    .map((app) => ({
      appId: app.id,
      containerName: app.containerName,
      state: states.get(app.containerName) || 'missing',
    }));

  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = getContainerStates;
