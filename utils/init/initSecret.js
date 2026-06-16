const crypto = require('node:crypto');
const fs = require('node:fs');
const { join } = require('node:path');

const Logger = require('../Logger');
const logger = new Logger();

const secretLocation = 'data/.secret';
const secretFullPath = join(__dirname, '../../', secretLocation);

const initSecret = () => {
  if (process.env.SECRET) {
    return;
  }

  if (fs.existsSync(secretFullPath)) {
    const storedSecret = fs.readFileSync(secretFullPath, 'utf-8').trim();

    if (storedSecret) {
      process.env.SECRET = storedSecret;
      logger.log(`Loaded JWT secret from ${secretLocation}`);

      return;
    }
  }

  const secret = crypto.randomBytes(32).toString('hex');
  process.env.SECRET = secret;

  const dataDir = join(__dirname, '../../data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(secretFullPath, secret);
  logger.log(`Generated new JWT secret and saved to ${secretLocation}`);
};

module.exports = initSecret;
