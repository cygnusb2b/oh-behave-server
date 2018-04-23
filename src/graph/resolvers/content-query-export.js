const ContentQueryExport = require('../../models/content-query-export');
const User = require('../../models/user');
const paginationResolvers = require('./pagination');
const Pagination = require('../../classes/pagination');

module.exports = {
  /**
   *
   */
  ContentQueryExport: {
    exportedBy: exportDoc => User.findOne({ _id: exportDoc.exportedById }),
  },

  /**
   *
   */
  ContentQueryExportConnection: paginationResolvers.connection,

  /**
   *
   */
  ContentQueryExportEdge: paginationResolvers.edge,

  /**
   *
   */
  Query: {
    /**
     *
     */
    allContentQueryExports: (root, { resultId, pagination, sort }, { auth }) => {
      auth.check();
      const criteria = { resultId };
      return new Pagination(ContentQueryExport, { pagination, sort, criteria });
    },
  },
};
