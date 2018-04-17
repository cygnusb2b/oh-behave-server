const graph = require('./graph');
const express = require('express');

module.exports = (app) => {
  app.use('/graph', graph);

  app.use(express.static('public'));
};
