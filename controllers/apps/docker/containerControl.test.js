const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// A throwaway Docker API on a local TCP port. It records every request so the
// tests can assert both what Flame sent and which paths it touched.
const containers = new Map();
let requests = [];
let overrides = new Map();
let server;

const inspectBody = (c) => ({
  Name: `/${c.name}`,
  Config: { Labels: c.labels },
  State: { Status: c.state },
});

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body === undefined ? undefined : JSON.stringify(body));
};

const handler = (req, res) => {
  const url = new URL(req.url, 'http://docker');
  requests.push(`${req.method} ${url.pathname}${url.search}`);

  const override = overrides.get(`${req.method} ${url.pathname}`);
  if (override) {
    return send(res, override.status, override.body);
  }

  if (req.method === 'GET' && url.pathname === '/containers/json') {
    return send(
      res,
      200,
      [...containers.values()].map((c) => ({
        Names: [`/${c.name}`],
        Labels: c.labels,
        State: c.state,
      }))
    );
  }

  const match = /^\/containers\/([^/]+)\/(json|start|stop)$/.exec(url.pathname);
  const container = match && containers.get(match[1]);

  if (!container) {
    return send(res, 404, { message: 'No such container' });
  }

  if (req.method === 'GET' && match[2] === 'json') {
    return send(res, 200, inspectBody(container));
  }

  if (req.method === 'POST' && match[2] === 'start') {
    if (container.state === 'running') return send(res, 304);
    container.state = 'running';
    return send(res, 204);
  }

  if (req.method === 'POST' && match[2] === 'stop') {
    if (container.state !== 'running') return send(res, 304);
    container.state = 'exited';
    return send(res, 204);
  }

  send(res, 404, { message: 'unknown' });
};

before(async () => {
  server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.env.DOCKER_HOST = `tcp://127.0.0.1:${server.address().port}`;
});

after(async () => {
  delete process.env.DOCKER_HOST;
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  requests = [];
  overrides = new Map();
  containers.clear();
  containers.set('web', {
    name: 'web',
    state: 'exited',
    labels: { 'flame.control': 'true' },
  });
  containers.set('db', {
    name: 'db',
    state: 'running',
    labels: { 'flame.name': 'DB' },
  });
});

// The require happens after the env is configured per-call, so the module can
// be loaded once at top level.
const {
  controlContainer,
  listContainerStates,
  assertValidContainerName,
} = require('./containerControl');

test('start flips an opted-in container and reports the post-action state', async () => {
  const result = await controlContainer('web', 'start');

  assert.deepEqual(result, { containerName: 'web', state: 'running' });
  assert.equal(containers.get('web').state, 'running');
  assert.deepEqual(requests, [
    'GET /containers/web/json',
    'POST /containers/web/start',
    'GET /containers/web/json',
  ]);
});

test('stop flips a running opted-in container', async () => {
  containers.get('web').state = 'running';

  const result = await controlContainer('web', 'stop');

  assert.deepEqual(result, { containerName: 'web', state: 'exited' });
  assert.ok(requests.includes('POST /containers/web/stop'));
});

test('rejects a container whose live labels lack flame.control=true', async () => {
  await assert.rejects(controlContainer('db', 'stop'), (err) => {
    assert.equal(err.statusCode, 403);
    return true;
  });

  // The label check must come before any state-changing call.
  assert.deepEqual(requests, ['GET /containers/db/json']);
  assert.equal(containers.get('db').state, 'running');
});

test('re-checks live labels: a container that lost the label is refused', async () => {
  // The app row may still say dockerControl=true; Docker is the authority.
  containers.get('web').labels = { 'flame.control': 'false' };

  await assert.rejects(controlContainer('web', 'start'), { statusCode: 403 });
  assert.equal(containers.get('web').state, 'exited');
  assert.ok(!requests.some((r) => r.startsWith('POST')));
});

test('treats 304 (already in that state) as success', async () => {
  containers.get('web').state = 'running';

  const result = await controlContainer('web', 'start');

  assert.deepEqual(result, { containerName: 'web', state: 'running' });
  assert.ok(requests.includes('POST /containers/web/start'));
});

test('rejects invalid container names before any request is made', async () => {
  for (const name of [
    '',
    '..',
    '.',
    'a/b',
    'a b',
    'web?x=1',
    'web#frag',
    '../json',
    '%2e%2e',
    'wéb',
    undefined,
    null,
    42,
  ]) {
    await assert.rejects(
      controlContainer(name, 'start'),
      { statusCode: 400 },
      JSON.stringify(name)
    );
  }

  assert.deepEqual(requests, []);
});

test('assertValidContainerName accepts the documented character set', () => {
  for (const name of ['web', 'my_app-1.2', 'A.B_c-d']) {
    assert.doesNotThrow(() => assertValidContainerName(name));
  }
});

test('rejects unknown actions', async () => {
  await assert.rejects(controlContainer('web', 'restart'), {
    statusCode: 400,
  });
  assert.deepEqual(requests, []);
});

test('a missing container is a 404', async () => {
  await assert.rejects(controlContainer('ghost', 'start'), {
    statusCode: 404,
  });
});

test('a Docker error on the action surfaces its message as a 502', async () => {
  overrides.set('POST /containers/web/start', {
    status: 500,
    body: { message: 'boom: driver failed' },
  });

  await assert.rejects(controlContainer('web', 'start'), (err) => {
    assert.equal(err.statusCode, 502);
    assert.match(err.message, /500/);
    assert.match(err.message, /boom: driver failed/);
    return true;
  });
});

test('an unreachable Docker API is a 502', async () => {
  const previous = process.env.DOCKER_HOST;
  // Port 1 on loopback refuses connections.
  process.env.DOCKER_HOST = 'tcp://127.0.0.1:1';

  try {
    await assert.rejects(controlContainer('web', 'start'), {
      statusCode: 502,
    });
  } finally {
    process.env.DOCKER_HOST = previous;
  }
});

test('listContainerStates uses one all=1 list call and indexes by name', async () => {
  const states = await listContainerStates();

  assert.deepEqual(requests, ['GET /containers/json?all=1']);
  assert.equal(states.get('web'), 'exited');
  assert.equal(states.get('db'), 'running');
  assert.equal(states.get('ghost'), undefined);
});

test('only allowlisted Docker paths are ever requested', async () => {
  await controlContainer('web', 'start');
  await controlContainer('web', 'stop');
  await listContainerStates();

  const allowed = [
    /^GET \/containers\/json(\?.*)?$/,
    /^GET \/containers\/[a-zA-Z0-9_.-]+\/json$/,
    /^POST \/containers\/[a-zA-Z0-9_.-]+\/start$/,
    /^POST \/containers\/[a-zA-Z0-9_.-]+\/stop(\?t=\d+)?$/,
  ];

  assert.ok(requests.length > 0);
  for (const request of requests) {
    assert.ok(
      allowed.some((re) => re.test(request)),
      `unexpected Docker request: ${request}`
    );
  }
});
