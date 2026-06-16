// Pure label-parsing step of Docker discovery, split out from useDocker.js so
// it can be unit-tested without the Docker API or DB. Given one container's
// labels (plus discovery config) it returns the list of apps that container
// should produce — [] when the container opts out or lacks a name/url.
//
// The derivation order mirrors the original inline logic: Traefik rules, then
// tsdproxy, then the flame.* fields. Any explicit flame.* label always wins
// over a derived value because derivation only fills fields that are absent.
const parseContainerLabels = (
  rawLabels,
  { tsdproxyDomain = '', defaultCategory = 'Apps' } = {}
) => {
  // Work on a copy: the original mutated the container's labels in place to
  // stash derived flame.* values, but a pure function must not touch its input.
  const labels = { ...rawLabels };

  // Traefik labels for URL configuration
  if (!('flame.url' in labels)) {
    for (const label of Object.keys(labels)) {
      if (/^traefik.*.frontend.rule/.test(label)) {
        // Traefik 1.x
        let value = labels[label];

        if (value.indexOf('Host') !== -1) {
          value = value.split('Host:')[1];
          labels['flame.url'] = 'https://' + value.split(',').join(';https://');
        }
      } else if (/^traefik.*?\.rule/.test(label)) {
        // Traefik 2.x
        const value = labels[label];

        if (value.indexOf('Host') !== -1) {
          const regex = /`([a-zA-Z0-9.-]+)`/g;
          const domains = [];
          let match = regex.exec(value);

          while (match != null) {
            domains.push('http://' + match[1]);
            match = regex.exec(value);
          }

          if (domains.length > 0) {
            labels['flame.url'] = domains.join(';');
          }
        }
      }
    }
  }

  // tsdproxy labels for URL configuration. A tsdproxy-exposed container
  // (tsdproxy.enable=true + tsdproxy.name) is published at
  // https://<tsdproxy.name>.<TSDPROXY_DOMAIN>, so derive the flame.* fields
  // from it. Requires a domain (e.g. example.ts.net); when unset, tsdproxy
  // discovery is skipped. Any explicit flame.* label wins.
  const domain = tsdproxyDomain.replace(/^\.|\.$/g, '');

  if (
    domain &&
    labels['tsdproxy.enable'] === 'true' &&
    'tsdproxy.name' in labels
  ) {
    const tsdName = labels['tsdproxy.name'];

    if (!('flame.url' in labels)) {
      labels['flame.url'] = `https://${tsdName}.${domain}`;
    }
    if (!('flame.name' in labels)) {
      labels['flame.name'] = tsdName;
    }
    if (!('flame.type' in labels)) {
      labels['flame.type'] = 'app';
    }
  }

  // A container is discovered when it has a name + url and isn't opted out
  // via flame.type. An absent flame.type defaults to "app"; only the exact
  // values "app" and "application" count (anything else opts the container
  // out).
  const type = labels['flame.type'] || 'app';

  if (
    !(
      'flame.name' in labels &&
      'flame.url' in labels &&
      /^app(lication)?$/.test(type)
    )
  ) {
    return [];
  }

  const category = labels['flame.category'] || defaultCategory;

  const names = labels['flame.name'].split(';');
  const urls = labels['flame.url'].split(';');
  const icons = 'flame.icon' in labels ? labels['flame.icon'].split(';') : [];
  // Optional theme-specific icons. When set, the client picks the matching
  // one for the active light/dark scheme and falls back to flame.icon.
  const iconsLight =
    'flame.icon.light' in labels ? labels['flame.icon.light'].split(';') : [];
  const iconsDark =
    'flame.icon.dark' in labels ? labels['flame.icon.dark'].split(';') : [];

  const apps = [];

  for (let i = 0; i < names.length; i++) {
    apps.push({
      name: names[i] || names[0],
      url: urls[i] || urls[0],
      icon: icons[i] || icons[0] || 'docker',
      iconLight: iconsLight[i] || iconsLight[0] || '',
      iconDark: iconsDark[i] || iconsDark[0] || '',
      category,
    });
  }

  return apps;
};

module.exports = parseContainerLabels;
