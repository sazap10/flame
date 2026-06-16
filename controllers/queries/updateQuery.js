const asyncWrapper = require('../../middleware/asyncWrapper');
const File = require('../../utils/File');

// @desc      Update query
// @route     PUT /api/queries/:prefix
// @access    Public
const updateQuery = asyncWrapper(async (req, res, _next) => {
  const file = new File('data/customQueries.json');
  const content = JSON.parse(file.read());

  const queryIdx = content.queries.findIndex(
    (q) => q.prefix === req.params.prefix
  );

  // query found
  if (queryIdx > -1) {
    content.queries = [
      ...content.queries.slice(0, queryIdx),
      req.body,
      ...content.queries.slice(queryIdx + 1),
    ];
  }

  file.write(content, true);

  res.status(200).json({
    success: true,
    data: content.queries,
  });
});

module.exports = updateQuery;
