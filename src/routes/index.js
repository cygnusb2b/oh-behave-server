const graph = require('./graph');
const exportRoute = require('./export');
const express = require('express');

module.exports = (app) => {
  app.use('/graph', graph);
  app.use('/export', exportRoute);

  app.use(express.static('public'));
};
