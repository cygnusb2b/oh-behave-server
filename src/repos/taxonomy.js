const PropertyRepo = require('./property');
const { getTaxonomyCollection, searchRegex } = require('../utils');

module.exports = {
  /**
   *
   * @param {string} tenant The property key, e.g. `cygnus_ofcr`.
   * @param {string} phrase The search phrase.
   * @param {string} [type=contains] The search type. Either `starts`, `exact` or `contains`.
   */
  async search(tenant, phrase, type = 'contains') {
    if (!phrase) throw new Error('No search phrase was provided.');
    const { key, baseVersion } = await PropertyRepo.findByKey(tenant, { key: 1, baseVersion: 1 });

    const collection = await getTaxonomyCollection(key, baseVersion);
    const cursor = await collection.find({
      name: searchRegex(phrase, type),
      status: 1,
    }, { name: 1, type: 1 }).limit(25);
    return cursor.toArray();
  },
};
