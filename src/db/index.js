const Client = require('./client');

const {
  AERILON_DSN,
  ANALYTICS_DSN,
  CAPRICA_DSN,
  PICON_DSN,
  RADIX_DSN,
} = process.env;

const aerilon = new Client(AERILON_DSN);
const analytics = new Client(ANALYTICS_DSN);
const caprica = new Client(CAPRICA_DSN);
const picon = new Client(PICON_DSN);
const radix = new Client(RADIX_DSN);

aerilon.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${aerilon.dsn}'\n`));
analytics.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${analytics.dsn}'\n`));
caprica.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${caprica.dsn}'\n`));
picon.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${picon.dsn}'\n`));
radix.connect().then(() => process.stdout.write(`Successful MongoDB connection to '${radix.dsn}'\n`));

module.exports = {
  aerilon,
  analytics,
  caprica,
  picon,
  radix,
};
