const mongoose = require('../mongoose');
const schema = require('../schema/content-query-export');

module.exports = mongoose.model('content-query-export', schema);
