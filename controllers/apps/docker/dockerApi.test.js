const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  normaliseDockerHost,
  resolveDockerEndpoint,
  isControlEnabled,
} = require('./dockerApi');

test('normaliseDockerHost turns tcp:// and http:// into an http base URL', () => {
  assert.equal(normaliseDockerHost('tcp://proxy:2375'), 'http://proxy:2375');
  assert.equal(normaliseDockerHost('http://proxy:2375'), 'http://proxy:2375');
  assert.equal(normaliseDockerHost('HTTP://proxy:2375/'), 'http://proxy:2375');
  assert.equal(
    normaliseDockerHost('  tcp://10.0.0.5:2375  '),
    'http://10.0.0.5:2375'
  );
});

test('normaliseDockerHost accepts a bare host:port', () => {
  assert.equal(normaliseDockerHost('proxy:2375'), 'http://proxy:2375');
});

test('normaliseDockerHost rejects schemes it cannot honour', () => {
  for (const value of [
    'unix:///var/run/docker.sock',
    'https://proxy:2376',
    'ssh://user@host',
  ]) {
    assert.throws(() => normaliseDockerHost(value), /Unsupported DOCKER_HOST/);
  }

  assert.throws(() => normaliseDockerHost('tcp://'), /empty/);
});

test('DOCKER_HOST overrides the configured host, even a localhost one', () => {
  assert.deepEqual(
    resolveDockerEndpoint({
      envHost: 'tcp://proxy:2375',
      configHost: 'localhost',
    }),
    { baseURL: 'http://proxy:2375' }
  );
});

test('without DOCKER_HOST a localhost setting uses the Docker socket', () => {
  assert.deepEqual(resolveDockerEndpoint({ configHost: 'localhost' }), {
    baseURL: 'http://localhost',
    socketPath: '/var/run/docker.sock',
  });
  // An empty/blank DOCKER_HOST counts as unset.
  assert.deepEqual(
    resolveDockerEndpoint({ envHost: '  ', configHost: 'localhost' }),
    { baseURL: 'http://localhost', socketPath: '/var/run/docker.sock' }
  );
});

test('without DOCKER_HOST a non-localhost setting is reached over http', () => {
  assert.deepEqual(resolveDockerEndpoint({ configHost: '192.168.1.5:2375' }), {
    baseURL: 'http://192.168.1.5:2375',
  });
});

test('isControlEnabled is true only for DOCKER_CONTROL=true', () => {
  const original = process.env.DOCKER_CONTROL;

  try {
    for (const [value, expected] of [
      ['true', true],
      ['false', false],
      ['1', false],
      ['TRUE', false],
      [undefined, false],
    ]) {
      if (value === undefined) {
        delete process.env.DOCKER_CONTROL;
      } else {
        process.env.DOCKER_CONTROL = value;
      }

      assert.equal(isControlEnabled(), expected, String(value));
    }
  } finally {
    if (original === undefined) {
      delete process.env.DOCKER_CONTROL;
    } else {
      process.env.DOCKER_CONTROL = original;
    }
  }
});
