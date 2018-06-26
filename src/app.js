const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');

const authStrategies = require('./auth-strategies');
const routes = require('./routes');

passport.use(authStrategies.bearer);

const app = express();
const CORS = cors();

app.use(passport.initialize());
app.use(helmet());

app.use(CORS);
app.options('*', CORS);

routes(app);

app.get('/', (req, res) => {
  res.redirect(301, '/app');
});

module.exports = app;
