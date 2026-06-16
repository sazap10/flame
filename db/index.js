const { Sequelize } = require('sequelize');
const { join } = require('node:path');
const { Umzug, SequelizeStorage } = require('umzug');

// Utils
const backupDB = require('./utils/backupDb');
const Logger = require('../utils/Logger');
const logger = new Logger();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/db.sqlite',
  logging: false,
});

const umzug = new Umzug({
  migrations: {
    glob: join(__dirname, './migrations/*.js'),
    // Migration files export { up, down } expecting the query interface as
    // their single argument. Adapt them to the umzug v3 resolver signature.
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: undefined,
});

const connectDB = async () => {
  try {
    backupDB();

    await sequelize.authenticate();

    // execute all pending migrations
    const pendingMigrations = await umzug.pending();

    if (pendingMigrations.length > 0) {
      logger.log('Executing pending migrations');
      await umzug.up();
    }

    logger.log('Connected to database');
  } catch (error) {
    logger.log(`Unable to connect to the database: ${error.message}`, 'ERROR');
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  sequelize,
};
