const { DataTypes } = require('sequelize');
const { STRING } = DataTypes;

const columns = {
  type: STRING,
  allowNull: true,
  defaultValue: '',
};

const up = async (query) => {
  await query.addColumn('apps', 'iconLight', columns);
  await query.addColumn('apps', 'iconDark', columns);
  await query.addColumn('bookmarks', 'iconLight', columns);
  await query.addColumn('bookmarks', 'iconDark', columns);
};

const down = async (query) => {
  await query.removeColumn('apps', 'iconLight');
  await query.removeColumn('apps', 'iconDark');
  await query.removeColumn('bookmarks', 'iconLight');
  await query.removeColumn('bookmarks', 'iconDark');
};

module.exports = {
  up,
  down,
};
