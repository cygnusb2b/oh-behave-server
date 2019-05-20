const PropertyRepo = require('./property');
const {
  getSectionCollection,
  searchRegex,
  isIdentifier,
  castId,
} = require('../utils');

const projection = { name: 1, alias: 1 };

module.exports = {
  /**
   *
   * @param {string} propertyId The property ID,.
   * @param {string} phrase The search phrase.
   * @param {string} [type=contains] The search type. Either `starts`, `exact` or `contains`.
   */
  async search(propertyId, phrase, type = 'contains') {
    if (!phrase) throw new Error('No search phrase was provided.');
    const { key, baseVersion, stack } = await PropertyRepo.findById(propertyId, {
      key: 1,
      baseVersion: 1,
      stack: 1,
    });

    const collection = await getSectionCollection(key, baseVersion, stack);
    const criteria = isIdentifier(phrase) ? { _id: castId(phrase), status: 1 } : {
      name: searchRegex(phrase, type),
      status: 1,
    };
    if (baseVersion === '3') criteria.type = 'Website';
    const cursor = await collection.find(criteria, { projection }).limit(25);
    return cursor.toArray();
  },

  async findByIds(propertyId, ids) {
    if (!ids.length) return [];

    const { key, baseVersion, stack } = await PropertyRepo.findById(propertyId, {
      key: 1,
      baseVersion: 1,
      stack: 1,
    });
    const collection = await getSectionCollection(key, baseVersion, stack);

    const cursor = await collection.find({ _id: { $in: ids } }, { projection });
    return cursor.toArray();
  },
};
