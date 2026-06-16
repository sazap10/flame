const asyncWrapper = require('../../middleware/asyncWrapper');
const App = require('../../models/App');
const loadConfig = require('../../utils/loadConfig');

// @desc      Create new app
// @route     POST /api/apps
// @access    Public
const createApp = asyncWrapper(async (req, res, _next) => {
  const { pinAppsByDefault } = await loadConfig();

  const body = { ...req.body };

  if (body.icon) {
    body.icon = body.icon.trim();
  }

  if (body.iconLight) {
    body.iconLight = body.iconLight.trim();
  }

  if (body.iconDark) {
    body.iconDark = body.iconDark.trim();
  }

  if (req.file) {
    body.icon = req.file.filename;
  }

  // FormData sends categoryId as a string; an empty string (or the -1 sentinel)
  // means uncategorised.
  if (body.categoryId === '' || body.categoryId === '-1') {
    body.categoryId = null;
  }

  const app = await App.create({
    ...body,
    isPinned: pinAppsByDefault,
  });

  res.status(201).json({
    success: true,
    data: app,
  });
});

module.exports = createApp;
