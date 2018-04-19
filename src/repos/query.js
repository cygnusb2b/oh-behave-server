const ContentQuery = require('../models/content-query');
const PropertyRepo = require('./property');
const { getContentCollection } = require('../utils');

module.exports = {
  /**
   *
   * @param {string} id The content query ID.
   * @param {?object} fields The model fields to return.
   */
  async findById(id, fields) {
    if (!id) throw new Error('No query id was provided.');
    const doc = await ContentQuery.findOne({ _id: id, deleted: false }, fields);
    if (!doc) throw new Error(`No query found for id '${id}'.`);
    return doc;
  },

  /**
   *
   * @param {string} queryId The content query ID.
   */
  async test(queryId) {
    const contentCount = await this.getContentIds(queryId, true);
    return { contentCount };
  },

  /**
   *
   * @param {string} queryId The content query ID.
   * @param {boolean} [countOnly=false] Whether to return a count only, or an array of IDs.
   */
  async getContentIds(queryId, countOnly = false) {
    const query = await this.findById(queryId);
    if (!query.criteria.length) return countOnly ? 0 : [];

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
        } else if (type === 'Section') {
          if (baseVersion === '4') {
            $and.push({ 'mutations.Website.primarySection.$id': { $in: ids } });
          } else {
            $and.push({ 'primarySection.$id': { $in: ids } });
          }
        }
      }
    });
    const criteria = { status: 1, $and };
    if (baseVersion === '4') {
      criteria.type = { $nin: ['Contact', 'Promotion', 'TextAd'] };
    } else {
      criteria.contentType = { $nin: ['Contact', 'Image', 'Note', 'PSCAd', 'TextAd'] };
    }
    if (countOnly) {
      const count = await collection.count(criteria);
      return count;
    }
    const cursor = await collection.find(criteria, { projection: { _id: 1 } });
    return cursor.toArray();
  },
};
