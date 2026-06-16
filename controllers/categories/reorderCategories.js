const asyncWrapper = require('../../middleware/asyncWrapper');
const Category = require('../../models/Category');

// @desc      Reorder categories
// @route     PUT /api/categories/0/reorder
// @access    Public
const reorderCategories = asyncWrapper(async (req, res, _next) => {
  // Await every update before responding so failures reach the error handler
  // (forEach(async) would fire-and-forget and resolve the request early).
  await Promise.all(
    req.body.categories.map(({ id, orderId }) =>
      Category.update({ orderId }, { where: { id } })
    )
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = reorderCategories;
