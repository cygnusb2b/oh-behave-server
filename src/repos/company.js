const PropertyRepo = require('./property');
const { getContentCollection, searchRegex } = require('../utils');

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

    const collection = await getContentCollection(key, baseVersion);

    const criteria = {
      name: searchRegex(phrase, type),
      status: 1,
    };
    if (baseVersion === '4') {
      criteria.type = 'Company';
    } else {
      criteria.contentType = 'Company';
    }
    const cursor = await collection.find(criteria, { name: 1 }).limit(25);
    return cursor.toArray();
  },
};
