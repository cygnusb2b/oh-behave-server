const ContentQuery = require('../../models/content-query');
const User = require('../../models/user');
const paginationResolvers = require('./pagination');
const Pagination = require('../../classes/pagination');
const CompanyRepo = require('../../repos/company');

module.exports = {
  /**
   *
   */
  ContentQuery: {
    createdBy: query => User.findOne({ _id: query.createdById }),
    updatedBy: query => User.findOne({ _id: query.updatedById }),
    criteria: async (query) => {
      const { criteria } = query;
      const data = await Promise.all(criteria.map(async (group) => {
        const { type, ids } = group;
        switch (type) {
          case 'Company':
            return CompanyRepo.findByIds(query.propertyId, ids);
          default:
            return [];
        }
      }));
      return data;
    },
  },

  /**
   *
   */
  ContentQueryConnection: paginationResolvers.connection,

  /**
   *
   */
  ContentQueryEdge: paginationResolvers.edge,

  /**
   *
   */
  Query: {
    /**
     *
     */
    contentQuery: async (root, { input }, { auth }) => {
      auth.check();
      const { id } = input;
      const record = await ContentQuery.findOne({ _id: id, deleted: false });
      if (!record) throw new Error(`No query record found for ID ${id}.`);
      return record;
    },

    /**
     *
     */
    allContentQueries: (root, { pagination, sort }) => {
      const criteria = { deleted: false };
      return new Pagination(ContentQuery, { pagination, sort, criteria });
    },
  },

  /**
   *
   */
  Mutation: {
    /**
     *
     */
    createContentQuery: (root, { input }, { auth }) => {
      auth.check();
      const { user } = auth;
      const { payload } = input;
      const { name, propertyId, criteria } = payload;
      const record = new ContentQuery({
        name,
        propertyId,
        criteria,
        createdById: user.id,
        updatedById: user.id,
      });
      return record.save();
    },

    /**
     *
     */
    updateContentQuery: async (root, { input }, { auth }) => {
      auth.check();
      const { user } = auth;
      const { id, payload } = input;
      const { name, propertyId, critiera } = payload;

      const record = await ContentQuery.findOne({ _id: id, deleted: false });
      if (!record) throw new Error(`No query record found for ID ${id}.`);
      if (auth.isAdmin() || user.id === record.createdById) {
        record.set({
          name,
          propertyId,
          critiera,
          updatedById: user.id,
        });
        return record.save();
      }
      throw new Error('You cannot update queries that you did not create.');
    },

    /**
     *
     */
    deleteContentQuery: async (root, { input }, { auth }) => {
      auth.check();
      const { user } = auth;
      const { id } = input;
      const record = await ContentQuery.findOne({ _id: id });
      if (!record) throw new Error(`No property record found for ID ${id}.`);
      if (auth.isAdmin() || user.id === record.createdById) {
        record.set({ deleted: true, updatedById: user.id });
        return record.save();
      }
      throw new Error('You cannot delete queries that you did not create.');
    },
  },
};
