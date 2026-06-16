const asyncWrapper = require('../../middleware/asyncWrapper');
const App = require('../../models/App');

// @desc      Reorder apps
// @route     PUT /api/apps/0/reorder
// @access    Public
const reorderApps = asyncWrapper(async (req, res, _next) => {
  // Await every update before responding so failures reach the error handler
  // (forEach(async) would fire-and-forget and resolve the request early).
  await Promise.all(
    req.body.apps.map(({ id, orderId }) =>
      App.update({ orderId }, { where: { id } })
    )
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = reorderApps;
