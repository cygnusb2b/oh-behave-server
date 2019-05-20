require('dotenv').config();
require('./newrelic');
const pkg = require('../package.json');
const app = require('./app');
const mongoose = require('./mongoose');
const db = require('./db');

const { PORT } = process.env;
const { log } = console;

process.on('unhandledRejection', (e) => {
  log('> Unhandled promise rejection. Throwing error...');
  throw e;
});

const server = app.listen(PORT, () => {
  process.stdout.write(`Express app '${pkg.name}' listening on port ${PORT}\n`);
});

module.exports = { server, mongoose, db };
