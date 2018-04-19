const ContentQuery = require('../models/content-query');
const PropertyRepo = require('./property');
const { getContentCollection } = require('../utils');

module.exports = {
  async findById(id, fields) {
    if (!id) throw new Error('No query id was provided.');
    const doc = await ContentQuery.findOne({ _id: id, deleted: false }, fields);
    if (!doc) throw new Error(`No query found for id '${id}'.`);
    return doc;
  },

  async test(id) {
    const query = await this.findById(id);
    const result = { contentCount: 0 };
    if (!query.criteria.length) return result;

    const { key, baseVersion } = await PropertyRepo.findById(query.propertyId, {
      key: 1,
      baseVersion: 1,
    });
    const collection = await getContentCollection(key, baseVersion);
    const $and = [];
    query.criteria.forEach((group) => {
      const { type, ids } = group;
      if (ids.length) {
        if (type === 'Taxonomy') {
          $and.push({ 'taxonomy.$id': { $in: ids } });
        } else if (type === 'Company') {
          $and.push({
            $or: [
              { _id: { $in: ids } },
              { company: { $in: ids } },
              { 'relatedTo.$id': { $in: ids } },
            ],
          });
        }
      }
    });
    const criteria = { status: 1, $and };
    result.contentCount = await collection.count(criteria);
    return result;
  },
};
