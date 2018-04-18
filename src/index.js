require('dotenv').config();
const pkg = require('../package.json');
const app = require('./app');
const mongoose = require('./mongoose');
const db = require('./db');

const { PORT } = process.env;

const server = app.listen(PORT, () => {
  process.stdout.write(`Express app '${pkg.name}' listening on port ${PORT}\n`);
});

module.exports = { server, mongoose, db };
