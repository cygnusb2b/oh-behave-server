const mongoose = require('mongoose');
const schema = require('../schema/property');

module.exports = mongoose.model('property', schema);
