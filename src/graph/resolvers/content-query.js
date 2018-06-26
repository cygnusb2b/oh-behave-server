const ContentQuery = require('../../models/content-query');
const User = require('../../models/user');
const paginationResolvers = require('./pagination');
const Pagination = require('../../classes/pagination');
const CompanyRepo = require('../../repos/company');
const TaxonomyRepo = require('../../repos/taxonomy');
const SectionRepo = require('../../repos/section');
const QueryRepo = require('../../repos/query');

const applyTypes = (type, items) => items.map(item => Object.assign(item, { __typename: type }));

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
        let items;
        switch (type) {
          case 'Company':
            items = await CompanyRepo.findByIds(query.propertyId, ids);
            break;
          case 'Taxonomy':
            items = await TaxonomyRepo.findByIds(query.propertyId, ids);
            break;
          case 'Section':
            items = await SectionRepo.findByIds(query.propertyId, ids);
            break;
          default:
            items = [];
        }
        return { type, items: applyTypes(type, items) };
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
      const { propertyId, id } = input;
      const record = await ContentQuery.findOne({ _id: id, propertyId, deleted: false });
      if (!record) throw new Error(`No query record found for ID ${id}.`);
      return record;
    },

    /**
     *
     */
    allContentQueries: (root, { propertyId, pagination, sort }, { auth }) => {
      auth.check();
      const criteria = { propertyId, deleted: false };
      return new Pagination(ContentQuery, { pagination, sort, criteria });
    },

    testContentQuery: async (root, { input }, { auth }) => {
      auth.check();
      const { id } = input;
      return QueryRepo.test(id);
    },

    contentQueryIds: async (root, { input }, { auth }) => {
      auth.check();
      const { id } = input;
      return QueryRepo.contentIds(id);
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
      const { name, propertyId, criteria } = payload;

      const record = await ContentQuery.findOne({ _id: id, deleted: false });
      if (!record) throw new Error(`No query record found for ID ${id}.`);
      if (record.propertyId.toString() !== propertyId) {
        throw new Error('You cannot switch properties.');
      }
      if (auth.isAdmin() || `${user.id}` === `${record.createdById}`) {
        record.set({
          name,
          propertyId,
          criteria,
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
      if (auth.isAdmin() || `${user.id}` === `${record.createdById}`) {
        record.set({ deleted: true, updatedById: user.id });
        return record.save();
      }
      throw new Error('You cannot delete queries that you did not create.');
    },
  },
};
