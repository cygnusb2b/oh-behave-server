const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const authStrategies = require('./auth-strategies');
const routes = require('./routes');

passport.use(authStrategies.bearer);

const app = express();

app.use(passport.initialize());
app.use(helmet());

routes(app);

app.get('/', (req, res) => {
  res.redirect(301, '/app');
});

module.exports = app;
