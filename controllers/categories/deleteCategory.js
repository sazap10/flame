const asyncWrapper = require('../../middleware/asyncWrapper');
const ErrorResponse = require('../../utils/ErrorResponse');
const Category = require('../../models/Category');
const Bookmark = require('../../models/Bookmark');
const App = require('../../models/App');

// @desc      Delete category
// @route     DELETE /api/categories/:id
// @access    Public
const deleteCategory = asyncWrapper(async (req, res, next) => {
  const category = await Category.findOne({
    where: { id: req.params.id },
  });

  if (!category) {
    return next(
      new ErrorResponse(
        `Category with id of ${req.params.id} was not found`,
        404
      )
    );
  }

  // Delete this category's bookmarks in a single awaited query so the handler
  // completes deterministically (a forEach(async ...) would not be awaited).
  await Bookmark.destroy({ where: { categoryId: req.params.id } });

  // Apps share categories with bookmarks but are more valuable to keep, so
  // uncategorise them (rather than delete) when their category is removed.
  await App.update(
    { categoryId: null },
    { where: { categoryId: req.params.id } }
  );

  await Category.destroy({
    where: { id: req.params.id },
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = deleteCategory;
