const { Op } = require('sequelize');
const App = require('../../../models/App');
const Category = require('../../../models/Category');
const Bookmark = require('../../../models/Bookmark');
const axios = require('axios');
const Logger = require('../../../utils/Logger');
const logger = new Logger();
const loadConfig = require('../../../utils/loadConfig');
const parseContainerLabels = require('./parseLabels');

// Discovery hits the Docker API and writes to the DB, but it's triggered on
// every (public) categories fetch, which polling/refreshes can amplify. Throttle
// it to at most once per interval.
const DISCOVERY_INTERVAL = 30 * 1000;
let lastDiscovery = 0;

// Discover running containers via the Docker API and turn them into Flame
// apps grouped into categories. A container's category comes from the
// `flame.category` label; containers without it fall back to the default
// category (DOCKER_DEFAULT_CATEGORY env var, or "Apps"). Any bookmark
// previously auto-created by discovery for the same service is removed so it
// isn't shown twice.
const useDocker = async () => {
  const now = Date.now();
  if (now - lastDiscovery < DISCOVERY_INTERVAL) {
    return;
  }
  lastDiscovery = now;

  const { dockerHost: host } = await loadConfig();

  const defaultCategory = process.env.DOCKER_DEFAULT_CATEGORY || 'Apps';

  let containers = null;

  // Get list of containers
  try {
    if (host.includes('localhost')) {
      // Use default host
      const { data } = await axios.get(
        `http://${host}/containers/json?{"status":["running"]}`,
        {
          socketPath: '/var/run/docker.sock',
        }
      );

      containers = data;
    } else {
      // Use custom host
      const { data } = await axios.get(
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

  // tsdproxy derives URLs from the TSDPROXY_DOMAIN env var (e.g. example.ts.net);
  // when unset, tsdproxy discovery is skipped.
  const tsdproxyDomain = process.env.TSDPROXY_DOMAIN || '';

  const dockerApps = [];

  for (const container of containers) {
    dockerApps.push(
      ...parseContainerLabels(container.Labels, {
        tsdproxyDomain,
        defaultCategory,
      })
    );
  }

  if (dockerApps.length === 0) {
    return;
  }

  // Resolve (find-or-create) each referenced category once, keyed by name.
  // A Map avoids prototype-pollution issues from label-derived keys.
  const categoryCache = new Map();

  const resolveCategory = async (name) => {
    if (categoryCache.has(name)) {
      return categoryCache.get(name);
    }

    const [category] = await Category.findOrCreate({
      where: { name },
      defaults: { name, isPinned: true },
    });

    categoryCache.set(name, category);
    return category;
  };

  // Collapse duplicate names so a single app maps to one record. Later
  // containers win, matching the old per-item loop where a second container
  // with the same name updated the row created by the first.
  const appByName = new Map();
  for (const item of dockerApps) {
    appByName.set(item.name, item);
  }

  // One query to look up every referenced app by name (regardless of its
  // current category, so flame.category can move it and we never create
  // duplicates), instead of a findOne per app.
  const existingApps = await App.findAll({
    where: { name: { [Op.in]: [...appByName.keys()] } },
    order: [['id', 'ASC']],
  });
  // name isn't unique, so a name can match multiple rows. Keep the lowest-id
  // one (the ordered first), matching the old findOne behaviour and keeping
  // which row gets updated deterministic across discovery cycles.
  const existingByName = new Map();
  for (const app of existingApps) {
    if (!existingByName.has(app.name)) {
      existingByName.set(app.name, app);
    }
  }

  const toCreate = [];
  const toUpdate = [];

  for (const item of appByName.values()) {
    const category = await resolveCategory(item.category);
    const existing = existingByName.get(item.name);

    if (existing) {
      toUpdate.push({
        id: existing.id,
        name: item.name,
        url: item.url,
        icon: item.icon,
        iconLight: item.iconLight,
        iconDark: item.iconDark,
        categoryId: category.id,
      });
    } else {
      // Pin newly discovered apps so they show on the home page, matching the
      // previous behaviour where discovery created bookmarks in a pinned
      // category. Only set on create — an app's pinned state is left untouched
      // on update so a user's manual unpin is respected.
      toCreate.push({
        name: item.name,
        url: item.url,
        icon: item.icon,
        iconLight: item.iconLight,
        iconDark: item.iconDark,
        categoryId: category.id,
        isPinned: true,
      });
    }
  }

  if (toCreate.length > 0) {
    await App.bulkCreate(toCreate);
  }

  // Upsert keyed on the primary key (every record carries an existing id), so
  // only the listed columns are overwritten. isPinned is deliberately excluded
  // so an app's pinned state is left untouched on update.
  if (toUpdate.length > 0) {
    await App.bulkCreate(toUpdate, {
      updateOnDuplicate: [
        'url',
        'icon',
        'iconLight',
        'iconDark',
        'categoryId',
      ],
    });
  }

  // Remove any bookmark previously auto-created by discovery for a service that
  // is now an app, so it isn't listed in both sections. Match on name AND url
  // so a manually-created bookmark that merely shares a name (but points
  // elsewhere) is left untouched.
  const seen = new Set();
  const discoveredBookmarks = [];

  for (const { name, url } of dockerApps) {
    const key = `${name}\0${url}`;
    if (!seen.has(key)) {
      seen.add(key);
      discoveredBookmarks.push({ name, url });
    }
  }

  await Bookmark.destroy({ where: { [Op.or]: discoveredBookmarks } });
};

module.exports = useDocker;
