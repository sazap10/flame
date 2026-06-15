const { DataTypes } = require('sequelize');
const { INTEGER } = DataTypes;

const column = {
  type: INTEGER,
  allowNull: true,
  defaultValue: null,
};

const up = async (query) => {
  // Guard against the column already existing: some instances ran an earlier
  // build of this migration (column added) without the migration being
  // recorded, which would otherwise fail with "duplicate column name".
  const table = await query.describeTable('apps');
  if (!table.categoryId) {
    await query.addColumn('apps', 'categoryId', column);
  }
};

const down = async (query) => {
  const table = await query.describeTable('apps');
  if (table.categoryId) {
    await query.removeColumn('apps', 'categoryId');
  }
};

module.exports = {
  up,
  down,
};
