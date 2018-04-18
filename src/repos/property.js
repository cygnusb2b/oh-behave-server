const Property = require('../models/property');

module.exports = {
  async findByKey(key, fields) {
    if (!key) throw new Error('No property key was provided.');
    const doc = await Property.findOne({ key, deleted: false }, fields);
    if (!doc) throw new Error(`No property found for key '${key}'.`);
    return doc;
  },
};
