const express = require('express');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

app.use(helmet());

routes(app);

module.exports = app;
