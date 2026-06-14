const App = require('../../../models/App');
const Category = require('../../../models/Category');
const Bookmark = require('../../../models/Bookmark');
const axios = require('axios');
const Logger = require('../../../utils/Logger');
const logger = new Logger();
const loadConfig = require('../../../utils/loadConfig');

// Discover running containers via the Docker API and turn them into Flame
// bookmarks grouped into categories. A container's category comes from the
// `flame.category` label; containers without it fall back to the default
// category (DOCKER_DEFAULT_CATEGORY env var, or "Apps"). Any app previously
// auto-created by discovery for the same service is removed so it isn't shown
// twice.
const useDocker = async () => {
  const { dockerHost: host } = await loadConfig();

  const defaultCategory = process.env.DOCKER_DEFAULT_CATEGORY || 'Apps';

  let containers = null;

  // Get list of containers
  try {
    if (host.includes('localhost')) {
      // Use default host
      let { data } = await axios.get(
        `http://${host}/containers/json?{"status":["running"]}`,
        {
          socketPath: '/var/run/docker.sock',
        }
      );

      containers = data;
    } else {
      // Use custom host
      let { data } = await axios.get(
        `http://${host}/containers/json?{"status":["running"]}`
      );

      containers = data;
    }
  } catch {
    logger.log(`Can't connect to the Docker API on ${host}`, 'ERROR');
  }

  if (!containers) {
    return;
  }

  // Filter out containers without any annotations
  containers = containers.filter((e) => Object.keys(e.Labels).length !== 0);

  const dockerBookmarks = [];

  for (const container of containers) {
    let labels = container.Labels;

    // Traefik labels for URL configuration
    if (!('flame.url' in labels)) {
      for (const label of Object.keys(labels)) {
        if (/^traefik.*.frontend.rule/.test(label)) {
          // Traefik 1.x
          let value = labels[label];

          if (value.indexOf('Host') !== -1) {
            value = value.split('Host:')[1];
            labels['flame.url'] =
              'https://' + value.split(',').join(';https://');
          }
        } else if (/^traefik.*?\.rule/.test(label)) {
          // Traefik 2.x
          const value = labels[label];

          if (value.indexOf('Host') !== -1) {
            const regex = /\`([a-zA-Z0-9\.\-]+)\`/g;
            const domains = [];

            while ((match = regex.exec(value)) != null) {
              domains.push('http://' + match[1]);
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
    // from it. Requires the TSDPROXY_DOMAIN env var (e.g. example.ts.net);
    // when unset, tsdproxy discovery is skipped. Any explicit flame.* label
    // wins, so a service can override the name/url/icon or opt out by setting
    // flame.type to something that isn't "app".
    const tsdproxyDomain = (process.env.TSDPROXY_DOMAIN || '').replace(
      /^\.|\.$/g,
      ''
    );

    if (
      tsdproxyDomain &&
      labels['tsdproxy.enable'] === 'true' &&
      'tsdproxy.name' in labels
    ) {
      const tsdName = labels['tsdproxy.name'];

      if (!('flame.url' in labels)) {
        labels['flame.url'] = `https://${tsdName}.${tsdproxyDomain}`;
      }
      if (!('flame.name' in labels)) {
        labels['flame.name'] = tsdName;
      }
      if (!('flame.type' in labels)) {
        labels['flame.type'] = 'app';
      }
    }

    // A container is discovered when it has a name + url and isn't opted out
    // via flame.type (an absent flame.type defaults to "app").
    const type = labels['flame.type'] || 'app';

    if ('flame.name' in labels && 'flame.url' in labels && /^app/.test(type)) {
      const category = labels['flame.category'] || defaultCategory;

      const names = labels['flame.name'].split(';');
      const urls = labels['flame.url'].split(';');
      const icons = 'flame.icon' in labels ? labels['flame.icon'].split(';') : [];

      for (let i = 0; i < names.length; i++) {
        dockerBookmarks.push({
          name: names[i] || names[0],
          url: urls[i] || urls[0],
          icon: icons[i] || icons[0] || 'docker',
          category,
        });
      }
    }
  }

  if (dockerBookmarks.length === 0) {
    return;
  }

  // Resolve (find-or-create) each referenced category once, keyed by name.
  const categoryCache = {};

  const resolveCategory = async (name) => {
    if (categoryCache[name]) {
      return categoryCache[name];
    }

    let [category] = await Category.findOrCreate({
      where: { name },
      defaults: { name, isPinned: true },
    });

    categoryCache[name] = category;
    return category;
  };

  for (const item of dockerBookmarks) {
    const category = await resolveCategory(item.category);

    // Match an existing bookmark by name (regardless of its current category)
    // so flame.category can move it and we never create duplicates.
    const existing = await Bookmark.findOne({ where: { name: item.name } });

    if (existing) {
      await existing.update({
        url: item.url,
        icon: item.icon,
        categoryId: category.id,
      });
    } else {
      await Bookmark.create({
        name: item.name,
        url: item.url,
        icon: item.icon,
        categoryId: category.id,
      });
    }
  }

  // Remove any app previously auto-created by discovery for a service that is
  // now a bookmark, so it isn't listed in both sections.
  const discoveredNames = [...new Set(dockerBookmarks.map((b) => b.name))];

  await App.destroy({ where: { name: discoveredNames } });
};

module.exports = useDocker;
