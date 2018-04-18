const Client = require('./client');

const { LEGACY_DSN, ANALYTICS_DSN, PLATFORM_DSN } = process.env;

const analytics = new Client(ANALYTICS_DSN);
const legacy = new Client(LEGACY_DSN);
const platform = new Client(PLATFORM_DSN);

analytics.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${analytics.dsn}'\n`));
legacy.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${legacy.dsn}'\n`));
platform.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${platform.dsn}'\n`));

module.exports = { analytics, legacy, platform };

