const mongoose = require('../mongoose');
const schema = require('../schema/content-query-result-row');

module.exports = mongoose.model('content-query-result-row', schema);
