const PropertyRepo = require('./property');
const { getSectionCollection, searchRegex } = require('../utils');

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
    const { key, baseVersion } = await PropertyRepo.findById(propertyId, {
      key: 1,
      baseVersion: 1,
    });

    const collection = await getSectionCollection(key, baseVersion);
    const id = parseInt(phrase, 10);
    const criteria = id ? { _id: id, status: 1 } : {
      name: searchRegex(phrase, type),
      status: 1,
    };
    if (baseVersion === '3') criteria.type = 'Website';
    const cursor = await collection.find(criteria, { projection }).limit(25);
    return cursor.toArray();
  },

  async findByIds(propertyId, ids) {
    if (!ids.length) return [];

    const { key, baseVersion } = await PropertyRepo.findById(propertyId, {
      key: 1,
      baseVersion: 1,
    });
    const collection = await getSectionCollection(key, baseVersion);

    const cursor = await collection.find({ _id: { $in: ids } }, { projection });
    return cursor.toArray();
  },
};
