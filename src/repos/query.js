const ContentQuery = require('../models/content-query');
const ContentQueryResult = require('../models/content-query-result');
const ContentQueryResultRow = require('../models/content-query-result-row');
const PropertyRepo = require('./property');
const {
  getContentCollection,
  getLatestAnalyticsCollection,
  getRadixCollection,
  getRadixEmailCollection,
  getMerrickUserCollection,
  getComponentsIdentityCollection,
  getArchiveAnalyticsCollection,
} = require('../utils');

const { assign } = Object;

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
    const query = await this.findById(queryId);
    const { key, baseVersion } = await PropertyRepo.findById(query.propertyId, {
      key: 1,
      baseVersion: 1,
    });

    const contentCount = await this.getContentIds(query, key, baseVersion, true);
    return { contentCount };
  },

  /**
   * @param {object} params
   * @param {string} params.queryId
   * @param {Date} params.startDate
   * @param {Date} params.endDate
   * @param {string} params.sourceType The raw analytics data source, either `latest` or `archive`.
   * @param {string} userId The User running the query.
   */
  async run({
    queryId,
    startDate,
    endDate,
    sourceType,
  }, userId) {
    const query = await this.findById(queryId);
    const { key, baseVersion, userSource } = await PropertyRepo.findById(query.propertyId, {
      key: 1,
      baseVersion: 1,
      userSource: 1,
    });

    const result = new ContentQueryResult({
      queryId,
      criteria: query.criteria, // Save this for posterity. ⌛
      startDate,
      endDate,
      baseVersion,
      userSource,
      sourceType,
      ranById: userId,
      ranAt: new Date(),
    });
    // Find content matching the query criteria.
    const contentIds = await this.getContentIds(query, key, baseVersion);
    result.contentCount = contentIds.length;

    // Ensure result is valid before continuing. ✅
    await result.validate();
    // No content. Nothing to query. Save and return. 💾
    if (!result.contentCount) return result.save();

    let data;
    if (result.sourceType === 'latest') {
      // Run query using data from the last 30 days. 📅
      data = await this.runLatestAggregation(result, key, baseVersion, contentIds);
    } else if (result.sourceType === 'archive') {
      // Run query using data from the monthly aggregated archive. 🗓️
      data = await this.runArchiveAggregation(result, key, contentIds);
    } else {
      throw new Error(`Unable to handle source type '${result.sourceType}'`);
    }

    const { userCount, contentViews, userIds } = data;
    result.set({ userCount, contentViews });
    // No users. Nothing to query. Save and return. 💾
    if (!userCount) return result.save();

    let users = [];
    if (userSource === 'Radix') {
      users = await this.retrieveRadixRows(userIds, key);
    } else if (userSource === 'Merrick') {
      users = await this.retrieveMerrickRows(userIds, key);
    } else if (userSource === 'Components') {
      users = await this.retrieveComponentRows(userIds, key);
    } else {
      throw new Error(`Unable to process user source '${userSource}'`);
    }

    result.foundUserCount = users.length;
    await result.save();
    const resultId = result.id;
    if (users.length) {
      // Insert individual users/rows.
      // This archives the results for future use,
      // regardless of changes to the property (e.g. the account moves from B3 to B4).
      // Also, apply the result ID so we can query later. 😜
      await ContentQueryResultRow.insertMany(users.map(u => assign(u, { resultId })));
    }
    return result;
  },

  async retrieveComponentRows(userIds, propertyKey) {
    const collection = await getComponentsIdentityCollection(propertyKey);
    const cursor = await collection.find({
      _id: { $in: userIds },
      email: { $exists: true },
    }, { projection: { email: 1 } });

    const results = await cursor.toArray();
    return results.reduce((rows, doc) => {
      rows.push({ sourceId: doc._id, email: doc.email });
      return rows;
    }, []);
  },

  async retrieveMerrickRows(userIds) {
    const collection = await getMerrickUserCollection();
    const cursor = await collection.find({
      _id: { $in: userIds },
    }, { projection: { email: 1 } });

    const results = await cursor.toArray();
    return results.reduce((rows, doc) => {
      rows.push({ sourceId: doc._id, email: doc.email });
      return rows;
    }, []);
  },

  async retrieveRadixRows(userIds, propertyKey) {
    const accounts = await this.getRadixAccountRows(userIds, propertyKey);
    const identites = await this.getRadixIdentityRows(userIds, propertyKey);
    return [].concat(accounts, identites);
  },

  async getRadixAccountRows(userIds, propertyKey) {
    const collection = await getRadixEmailCollection(propertyKey);
    const cursor = await collection.find({
      account: { $in: userIds },
    }, { projection: { value: 1 } });

    const results = await cursor.toArray();
    return results.reduce((rows, doc) => {
      rows.push({ sourceId: doc._id, email: doc.value });
      return rows;
    }, []);
  },

  async getRadixIdentityRows(userIds, propertyKey) {
    const collection = await getRadixCollection(propertyKey);
    const cursor = await collection.find({
      _id: { $in: userIds },
      'emails.isPrimary': { $exists: true },
    }, { projection: { emails: 1 } });

    const results = await cursor.toArray();
    return results.reduce((rows, doc) => {
      const email = doc.emails.find(obj => obj.isPrimary);
      if (email && email.value) rows.push({ sourceId: doc._id, email: email.value });
      return rows;
    }, []);
  },


  async runLatestAggregation({ startDate, endDate }, propertyKey, baseVersion, contentIds) {
    const collection = await getLatestAnalyticsCollection(propertyKey, baseVersion);

    const pipeline = [
      {
        $match: {
          action: 'view',
          clientId: { $in: contentIds },
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          'session.customerId': { $ne: null },
        },
      },
      {
        $group: {
          _id: '$session.customerId',
          contentViews: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          userCount: { $sum: 1 },
          userIds: { $push: '$_id' },
          contentViews: { $sum: '$contentViews' },
        },
      },
    ];
    const cursor = await collection.aggregate(pipeline);
    const result = await cursor.toArray();
    if (result.length) return result[0];
    return { userCount: 0, userIds: [], contentViews: 0 };
  },

  async runArchiveAggregation({ startDate, endDate }, propertyKey, contentIds) {
    const collection = await getArchiveAnalyticsCollection(propertyKey);
    const pipeline = [
      {
        $match: {
          'metadata.month': {
            $gte: startDate,
            $lte: endDate,
          },
          'metadata.contentId': { $in: contentIds },
          'metadata.userId': { $exists: true },
        },
      },
      {
        $group: {
          _id: '$metadata.userId',
          contentViews: { $sum: '$pageviews' },
        },
      },
      {
        $group: {
          _id: null,
          userCount: { $sum: 1 },
          userIds: { $push: '$_id' },
          contentViews: { $sum: '$contentViews' },
        },
      },
    ];
    const cursor = await collection.aggregate(pipeline);
    const result = await cursor.toArray();
    if (result.length) return result[0];
    return { userCount: 0, userIds: [], contentViews: 0 };
  },

  /**
   *
   * @param {string} queryId The content query ID.
   * @param {boolean} [countOnly=false] Whether to return a count only, or an array of IDs.
   */
  async getContentIds(query, propertyKey, baseVersion, countOnly = false) {
    if (!query.criteria.length) return countOnly ? 0 : [];

    const collection = await getContentCollection(propertyKey, baseVersion);
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
    const results = await cursor.toArray();
    return results.map(r => r._id);
  },
};
