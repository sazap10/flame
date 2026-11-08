const ErrorResponse = require('../../../utils/ErrorResponse');
const { CONTROL_LABEL, isControlLabelSet } = require('./controlLabel');
const { dockerRequest } = require('./dockerApi');

// Container start/stop against the Docker API. The only Docker paths used are:
//   GET  /containers/json?all=1
//   GET  /containers/<name>/json
//   POST /containers/<name>/start
//   POST /containers/<name>/stop
// (documented in the README so a socket proxy can allowlist exactly these).

const NAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const ACTIONS = ['start', 'stop'];

// `stop` blocks until Docker's grace period (10s by default) ends, so its
// timeout must exceed that; the other calls return immediately.
const REQUEST_TIMEOUT = 10 * 1000;
const STOP_TIMEOUT = 30 * 1000;

// The container name goes into the request URL, so validate it first. The
// extra check rejects "." / "..", which match the pattern but would be
// resolved as path segments.
const assertValidContainerName = (name) => {
  if (
    typeof name !== 'string' ||
    !NAME_PATTERN.test(name) ||
    /^\.+$/.test(name)
  ) {
    throw new ErrorResponse('Invalid container name', 400);
  }
};

const dockerMessage = (res) =>
  res.data?.message || res.statusText || 'no details';

// validateStatus accepts everything so callers can treat 304 (already in that
// state) as success; a thrown error therefore always means the Docker API was
// unreachable.
const call = async (config) => {
  try {
    return await dockerRequest({
      timeout: REQUEST_TIMEOUT,
      validateStatus: () => true,
      ...config,
    });
  } catch (err) {
    throw new ErrorResponse(`Docker API request failed: ${err.message}`, 502);
  }
};

const inspectContainer = async (name) => {
  const res = await call({
    method: 'get',
    url: `/containers/${name}/json`,
  });

  if (res.status === 404) {
    throw new ErrorResponse(`Container "${name}" was not found`, 404);
  }

  if (res.status !== 200) {
    throw new ErrorResponse(
      `Docker API responded ${res.status} when inspecting "${name}": ${dockerMessage(res)}`,
      502
    );
  }

  return res.data;
};

// Map of container name -> Docker State string, from a single list call.
// Containers can have several names (links); each one is indexed.
const listContainerStates = async () => {
  const res = await call({
    method: 'get',
    url: '/containers/json',
    params: { all: 1 },
  });

  if (res.status !== 200) {
    throw new ErrorResponse(
      `Docker API responded ${res.status} when listing containers: ${dockerMessage(res)}`,
      502
    );
  }

  const states = new Map();

  for (const container of res.data) {
    for (const name of container.Names || []) {
      states.set(name.replace(/^\//, ''), container.State);
    }
  }

  return states;
};

// Start or stop an opted-in container and return its post-action state. The
// live container labels are re-checked on every call: the DB flag is only a
// hint for the UI and is never trusted for authorisation.
const controlContainer = async (name, action) => {
  if (!ACTIONS.includes(action)) {
    throw new ErrorResponse(`Unsupported container action "${action}"`, 400);
  }

  assertValidContainerName(name);

  const before = await inspectContainer(name);

  if (!isControlLabelSet(before.Config?.Labels)) {
    throw new ErrorResponse(
      `Container "${name}" is not labelled ${CONTROL_LABEL}=true`,
      403
    );
  }

  const res = await call({
    method: 'post',
    url: `/containers/${name}/${action}`,
    timeout: action === 'stop' ? STOP_TIMEOUT : REQUEST_TIMEOUT,
  });

  // 204 = done, 304 = already in that state; both are success.
  if (res.status !== 204 && res.status !== 304) {
    throw new ErrorResponse(
      `Docker API responded ${res.status} when trying to ${action} "${name}": ${dockerMessage(res)}`,
      res.status === 404 ? 404 : 502
    );
  }

  const after = await inspectContainer(name);

  return { containerName: name, state: after.State?.Status };
};

module.exports = {
  assertValidContainerName,
  inspectContainer,
  listContainerStates,
  controlContainer,
};
