const { DataTypes } = require('sequelize');
const { INTEGER } = DataTypes;

const column = {
  type: INTEGER,
  allowNull: true,
  defaultValue: null,
};

const up = async (query) => {
  await query.addColumn('apps', 'categoryId', column);
};

const down = async (query) => {
  await query.removeColumn('apps', 'categoryId');
};

module.exports = {
  up,
  down,
};
