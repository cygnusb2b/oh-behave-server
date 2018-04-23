const ContentQueryResult = require('../../models/content-query-result');
const ContentQueryResultRow = require('../../models/content-query-result-row');
const paginationResolvers = require('./pagination');
const Pagination = require('../../classes/pagination');

module.exports = {
  /**
   *
   */
  ContentQueryResultRow: {
    result: row => ContentQueryResult.findOne({ _id: row.resultId }),
  },

  /**
   *
   */
  ContentQueryResultRowConnection: paginationResolvers.connection,

  /**
   *
   */
  ContentQueryResultRowEdge: paginationResolvers.edge,

  /**
   *
   */
  Query: {
    /**
     *
     */
    contentQueryResultRow: async (root, { input }, { auth }) => {
      auth.check();
      const { id } = input;
      const record = await ContentQueryResultRow.findOne({ _id: id });
      if (!record) throw new Error(`No query record found for ID ${id}.`);
      return record;
    },

    /**
     *
     */
    allContentQueryResultRows: (root, { resultId, pagination, sort }, { auth }) => {
      auth.check();
      const criteria = { resultId };
      return new Pagination(ContentQueryResultRow, { pagination, sort, criteria });
    },
  },
};
