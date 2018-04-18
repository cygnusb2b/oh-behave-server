const mongoose = require('../mongoose');
const schema = require('../schema/content-query');

module.exports = mongoose.model('content-query', schema);
