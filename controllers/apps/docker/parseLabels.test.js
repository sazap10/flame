const { test } = require('node:test');
const assert = require('node:assert/strict');

const parseContainerLabels = require('./parseLabels');

test('returns [] for a container without flame labels', () => {
  assert.deepEqual(parseContainerLabels({}), []);
  assert.deepEqual(parseContainerLabels({ 'com.docker.compose': 'x' }), []);
});

test('discovers a basic flame.* app and defaults icon/category', () => {
  const apps = parseContainerLabels({
    'flame.name': 'Pi-hole',
    'flame.url': 'https://pi.hole',
  });

  assert.deepEqual(apps, [
    {
      name: 'Pi-hole',
      url: 'https://pi.hole',
      icon: 'docker',
      iconLight: '',
      iconDark: '',
      category: 'Apps',
    },
  ]);
});

test('uses the provided defaultCategory and flame.category override', () => {
  const [withDefault] = parseContainerLabels(
    { 'flame.name': 'A', 'flame.url': 'https://a' },
    { defaultCategory: 'Self-Hosted' }
  );
  assert.equal(withDefault.category, 'Self-Hosted');

  const [withLabel] = parseContainerLabels(
    {
      'flame.name': 'A',
      'flame.url': 'https://a',
      'flame.category': 'Media',
    },
    { defaultCategory: 'Self-Hosted' }
  );
  assert.equal(withLabel.category, 'Media');
});

test('parses a Traefik 1.x frontend.rule (Host: syntax)', () => {
  const [app] = parseContainerLabels({
    'flame.name': 'Service',
    'traefik.frontend.rule': 'Host:service.example.com',
  });

  assert.equal(app.url, 'https://service.example.com');
});

test('Traefik 1.x comma-separated hosts pair with ;-separated names', () => {
  // The derived flame.url carries both hosts (;-joined); each is paired with
  // the matching flame.name entry. A lone name only takes the first host.
  const [solo] = parseContainerLabels({
    'flame.name': 'Service',
    'traefik.frontend.rule': 'Host:a.example.com,b.example.com',
  });
  assert.equal(solo.url, 'https://a.example.com');

  const paired = parseContainerLabels({
    'flame.name': 'A;B',
    'traefik.frontend.rule': 'Host:a.example.com,b.example.com',
  });
  assert.deepEqual(
    paired.map((app) => app.url),
    ['https://a.example.com', 'https://b.example.com']
  );
});

test('parses a Traefik 2.x rule with a backtick Host() matcher', () => {
  const [app] = parseContainerLabels({
    'flame.name': 'Service',
    'traefik.http.routers.svc.rule': 'Host(`service.example.com`)',
  });

  assert.equal(app.url, 'http://service.example.com');
});

test('Traefik 2.x collects multiple Host() domains, paired with names', () => {
  // Both domains are gathered into the derived flame.url; a lone name takes
  // only the first, while ;-separated names pair up one-to-one.
  const [solo] = parseContainerLabels({
    'flame.name': 'Service',
    'traefik.http.routers.svc.rule':
      'Host(`a.example.com`) || Host(`b.example.com`)',
  });
  assert.equal(solo.url, 'http://a.example.com');

  const paired = parseContainerLabels({
    'flame.name': 'A;B',
    'traefik.http.routers.svc.rule':
      'Host(`a.example.com`) || Host(`b.example.com`)',
  });
  assert.deepEqual(
    paired.map((app) => app.url),
    ['http://a.example.com', 'http://b.example.com']
  );
});

test('an explicit flame.url overrides a Traefik-derived url', () => {
  const [app] = parseContainerLabels({
    'flame.name': 'Service',
    'flame.url': 'https://override.example.com',
    'traefik.http.routers.svc.rule': 'Host(`derived.example.com`)',
  });

  assert.equal(app.url, 'https://override.example.com');
});

test('derives url/name/type from tsdproxy labels when TSDPROXY_DOMAIN is set', () => {
  const [app] = parseContainerLabels(
    {
      'tsdproxy.enable': 'true',
      'tsdproxy.name': 'grafana',
    },
    { tsdproxyDomain: 'example.ts.net' }
  );

  assert.equal(app.name, 'grafana');
  assert.equal(app.url, 'https://grafana.example.ts.net');
});

test('tsdproxy derivation is skipped without a domain', () => {
  const apps = parseContainerLabels({
    'tsdproxy.enable': 'true',
    'tsdproxy.name': 'grafana',
  });

  assert.deepEqual(apps, []);
});

test('tsdproxy derivation is skipped when not enabled', () => {
  const apps = parseContainerLabels(
    { 'tsdproxy.name': 'grafana' },
    { tsdproxyDomain: 'example.ts.net' }
  );

  assert.deepEqual(apps, []);
});

test('tolerates leading/trailing dots on the tsdproxy domain', () => {
  const [app] = parseContainerLabels(
    { 'tsdproxy.enable': 'true', 'tsdproxy.name': 'grafana' },
    { tsdproxyDomain: '.example.ts.net.' }
  );

  assert.equal(app.url, 'https://grafana.example.ts.net');
});

test('explicit flame.* labels override tsdproxy-derived values', () => {
  const [app] = parseContainerLabels(
    {
      'tsdproxy.enable': 'true',
      'tsdproxy.name': 'grafana',
      'flame.name': 'Grafana',
      'flame.url': 'https://grafana.internal',
    },
    { tsdproxyDomain: 'example.ts.net' }
  );

  assert.equal(app.name, 'Grafana');
  assert.equal(app.url, 'https://grafana.internal');
});

test('splits ;-separated name/url/icon into multiple apps', () => {
  const apps = parseContainerLabels({
    'flame.name': 'App One;App Two',
    'flame.url': 'https://one;https://two',
    'flame.icon': 'mdi-one;mdi-two',
  });

  assert.equal(apps.length, 2);
  assert.deepEqual(
    apps.map((a) => [a.name, a.url, a.icon]),
    [
      ['App One', 'https://one', 'mdi-one'],
      ['App Two', 'https://two', 'mdi-two'],
    ]
  );
});

test('falls back to the first value when later name/url/icon entries are missing', () => {
  const apps = parseContainerLabels({
    'flame.name': 'App One;App Two',
    'flame.url': 'https://one',
    'flame.icon': 'mdi-one',
  });

  assert.equal(apps.length, 2);
  // Second app reuses the first url/icon since only one was provided.
  assert.deepEqual(apps[1], {
    name: 'App Two',
    url: 'https://one',
    icon: 'mdi-one',
    iconLight: '',
    iconDark: '',
    category: 'Apps',
  });
});

test('parses theme-specific flame.icon.light / flame.icon.dark', () => {
  const [app] = parseContainerLabels({
    'flame.name': 'Service',
    'flame.url': 'https://service',
    'flame.icon': 'base',
    'flame.icon.light': 'light-icon',
    'flame.icon.dark': 'dark-icon',
  });

  assert.equal(app.icon, 'base');
  assert.equal(app.iconLight, 'light-icon');
  assert.equal(app.iconDark, 'dark-icon');
});

test('flame.type opt-out: only app/application are discovered', () => {
  const base = { 'flame.name': 'Service', 'flame.url': 'https://service' };

  assert.equal(
    parseContainerLabels({ ...base, 'flame.type': 'app' }).length,
    1
  );
  assert.equal(
    parseContainerLabels({ ...base, 'flame.type': 'application' }).length,
    1
  );
  assert.deepEqual(
    parseContainerLabels({ ...base, 'flame.type': 'bookmark' }),
    []
  );
  // An absent flame.type defaults to "app", so a bare name+url is discovered.
  assert.equal(parseContainerLabels(base).length, 1);
});

test('does not mutate the caller-provided labels object', () => {
  const labels = {
    'flame.name': 'Service',
    'traefik.http.routers.svc.rule': 'Host(`service.example.com`)',
  };
  const snapshot = { ...labels };

  parseContainerLabels(labels);

  assert.deepEqual(labels, snapshot);
});
