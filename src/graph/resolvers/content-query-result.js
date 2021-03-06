const ContentQueryResult = require('../../models/content-query-result');
const ContentQueryExport = require('../../models/content-query-export');
const User = require('../../models/user');
const paginationResolvers = require('./pagination');
const Pagination = require('../../classes/pagination');
const QueryRepo = require('../../repos/query');

module.exports = {
  /**
   *
   */
  ContentQueryResult: {
    ranBy: result => User.findOne({ _id: result.ranById }),
    exports: result => ContentQueryExport.find({ resultId: result.id }).sort({ exportedAt: -1 }),
  },

  /**
   *
   */
  ContentQueryResultConnection: paginationResolvers.connection,

  /**
   *
   */
  ContentQueryResultEdge: paginationResolvers.edge,

  /**
   *
   */
  Query: {
    /**
     *
     */
    contentQueryResult: async (root, { input }, { auth }) => {
      auth.check();
      const { id } = input;
      const record = await ContentQueryResult.findOne({ _id: id, deleted: false });
      if (!record) throw new Error(`No query record found for ID ${id}.`);
      return record;
    },

    /**
     *
     */
    allContentQueryResults: (root, { queryId, pagination, sort }, { auth }) => {
      auth.check();
      const criteria = { queryId, deleted: false };
      return new Pagination(ContentQueryResult, { pagination, sort, criteria });
    },
  },

  /**
   *
   */
  Mutation: {
    /**
     *
     */
    createContentQueryResult: (root, { input }, { auth }) => {
      auth.check();
      const { user } = auth;
      const { payload } = input;
      const {
        queryId,
        startDate,
        endDate,
        sourceType,
      } = payload;
      return QueryRepo.run({
        queryId,
        startDate,
        endDate,
        sourceType,
      }, user.id);
    },
  },
};
