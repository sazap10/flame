const asyncWrapper = require('../../middleware/asyncWrapper');
const Bookmark = require('../../models/Bookmark');

// @desc      Reorder bookmarks
// @route     PUT /api/bookmarks/0/reorder
// @access    Public
const reorderBookmarks = asyncWrapper(async (req, res, _next) => {
  // Await every update before responding so failures reach the error handler
  // (forEach(async) would fire-and-forget and resolve the request early).
  await Promise.all(
    req.body.bookmarks.map(({ id, orderId }) =>
      Bookmark.update({ orderId }, { where: { id } })
    )
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = reorderBookmarks;
