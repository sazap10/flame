const express = require('express');
const router = express.Router();

// middleware
const {
  auth,
  requireAuth,
  requireDockerControl,
  upload,
} = require('../middleware');

const {
  createApp,
  getAllApps,
  getSingleApp,
  updateApp,
  deleteApp,
  reorderApps,
  getContainerStates,
  startContainer,
  stopContainer,
} = require('../controllers/apps');

router
  .route('/')
  .post(auth, requireAuth, upload, createApp)
  .get(auth, getAllApps);

// Docker container control (DOCKER_CONTROL=true). Registered before /:id so
// "containers" isn't captured as an app id.
router
  .route('/containers')
  .get(auth, requireAuth, requireDockerControl, getContainerStates);

router
  .route('/:id/start')
  .post(auth, requireAuth, requireDockerControl, startContainer);

router
  .route('/:id/stop')
  .post(auth, requireAuth, requireDockerControl, stopContainer);

router
  .route('/:id')
  .get(auth, getSingleApp)
  .put(auth, requireAuth, upload, updateApp)
  .delete(auth, requireAuth, deleteApp);

router.route('/0/reorder').put(auth, requireAuth, reorderApps);

module.exports = router;
