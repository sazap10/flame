const asyncWrapper = require('../../middleware/asyncWrapper');
const App = require('../../models/App');

// @desc      Update app
// @route     PUT /api/apps/:id
// @access    Public
const updateApp = asyncWrapper(async (req, res, next) => {
  let app = await App.findOne({
    where: { id: req.params.id },
  });

  if (!app) {
    return next(
      new ErrorResponse(
        `App with the id of ${req.params.id} was not found`,
        404
      )
    );
  }

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
  // means uncategorised. Only normalise when explicitly present so partial
  // updates (e.g. pin/unpin) don't clear an existing category.
  if (body.categoryId === '' || body.categoryId === '-1') {
    body.categoryId = null;
  }

  app = await app.update(body);

  res.status(200).json({
    success: true,
    data: app,
  });
});

module.exports = updateApp;
