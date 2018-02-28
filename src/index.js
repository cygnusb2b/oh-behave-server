require('dotenv').config();
const pkg = require('../package.json');
const app = require('./app');
const mongoose = require('./mongoose');

const { PORT } = process.env;

app.listen(PORT);
process.stdout.write(`Express app '${pkg.name}' listening on port ${PORT}\n`);

module.exports = { app, mongoose };
