const asyncWrapper = require('../../middleware/asyncWrapper');
const File = require('../../utils/File');

// @desc      Get themes file
// @route     GET /api/themes
// @access    Public
const getThemes = asyncWrapper(async (_req, res, _next) => {
  const file = new File('data/themes.json');
  const content = JSON.parse(file.read());

  res.status(200).json({
    success: true,
    data: content.themes,
  });
});

module.exports = getThemes;
