const escapeRegex = require('escape-string-regexp');
const PropertyRepo = require('./property');
const utils = require('../utils');

module.exports = {
  /**
   *
   * @param {string} tenant The property key, e.g. `cygnus_ofcr`
   * @param {string} phrase The search phrase
   */
  async search(tenant, phrase) {
    if (!phrase) throw new Error('No search phrase was provided.');
    const { key, baseVersion } = await PropertyRepo.findByKey(tenant, { key: 1, baseVersion: 1 });

    const collection = await utils.getTaxonomyCollection(key, baseVersion);
    const regex = new RegExp(`${escapeRegex(phrase)}`, 'i');
    return collection.find({ name: regex, status: 1 }, { name: 1, type: 1 }).limit(25);
  },
};
