const { DataTypes } = require('sequelize');
const { STRING, BOOLEAN } = DataTypes;

const columns = {
  containerName: {
    type: STRING,
    allowNull: true,
    defaultValue: null,
  },
  dockerControl: {
    type: BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
};

const up = async (query) => {
  // Guard each column so a partially applied earlier run can't fail the
  // migration with "duplicate column name".
  const table = await query.describeTable('apps');

  for (const [name, definition] of Object.entries(columns)) {
    if (!table[name]) {
      await query.addColumn('apps', name, definition);
    }
  }
};

const down = async (query) => {
  const table = await query.describeTable('apps');

  for (const name of Object.keys(columns)) {
    if (table[name]) {
      await query.removeColumn('apps', name);
    }
  }
};

module.exports = {
  up,
  down,
};
