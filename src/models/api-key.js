const mongoose = require('../mongoose');
const schema = require('../schema/api-key');

module.exports = mongoose.model('api-key', schema);
