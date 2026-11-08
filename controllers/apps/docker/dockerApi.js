const axios = require('axios');
const loadConfig = require('../../../utils/loadConfig');

// Single place that knows how to reach the Docker API, shared by discovery
// (useDocker) and container control. Every call goes through `dockerRequest`.

// Container control is opt-in: DOCKER_CONTROL=true enables start/stop.
const isControlEnabled = () => process.env.DOCKER_CONTROL === 'true';

// Normalise DOCKER_HOST (tcp://host:port, http://host:port or bare host:port)
// to a plain http base URL. Other schemes (unix://, ssh://, https://) aren't
// supported; fail loudly rather than silently talking to the wrong endpoint.
const normaliseDockerHost = (value) => {
  const host = value.trim();
  const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(host);

  if (scheme && !/^(tcp|http)$/i.test(scheme[1])) {
    throw new Error(
      `Unsupported DOCKER_HOST scheme "${scheme[1]}://" (use tcp:// or http://)`
    );
  }

  const bare = host.replace(/^[a-z]+:\/\//i, '').replace(/\/+$/, '');

  if (!bare) {
    throw new Error('DOCKER_HOST is empty');
  }

  return `http://${bare}`;
};

// Build the axios endpoint config (baseURL, plus socketPath for the local
// socket). DOCKER_HOST, when set, overrides the "Docker host" setting;
// otherwise a localhost setting uses /var/run/docker.sock and anything else is
// reached over http.
const resolveDockerEndpoint = ({ envHost, configHost }) => {
  if (envHost?.trim()) {
    return { baseURL: normaliseDockerHost(envHost) };
  }

  if (configHost.includes('localhost')) {
    return {
      baseURL: `http://${configHost}`,
      socketPath: '/var/run/docker.sock',
    };
  }

  return { baseURL: `http://${configHost}` };
};

// Where requests go right now: DOCKER_HOST wins, then the DB setting.
const getDockerEndpoint = async () => {
  const envHost = process.env.DOCKER_HOST;

  if (envHost?.trim()) {
    return resolveDockerEndpoint({ envHost });
  }

  const { dockerHost: configHost } = await loadConfig();
  return resolveDockerEndpoint({ configHost });
};

// Human-readable target for log/error messages.
const describeEndpoint = ({ baseURL, socketPath }) =>
  socketPath ? `${socketPath} (${baseURL})` : baseURL;

// Issue a Docker API request. `config` is an axios request config; `url` must
// be one of the unversioned /containers/... paths documented in the README.
const dockerRequest = async (config) => {
  const endpoint = await getDockerEndpoint();
  return axios.request({ ...endpoint, ...config });
};

module.exports = {
  isControlEnabled,
  normaliseDockerHost,
  resolveDockerEndpoint,
  getDockerEndpoint,
  describeEndpoint,
  dockerRequest,
};
