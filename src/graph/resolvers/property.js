const Property = require('../../models/property');
const paginationResolvers = require('./pagination');
const Pagination = require('../../classes/pagination');
const TypeAhead = require('../../classes/type-ahead');

module.exports = {
  /**
   *
   */
  PropertyConnection: paginationResolvers.connection,

  /**
   *
   */
  PropertyEdge: paginationResolvers.edge,

  /**
   *
   */
  Query: {
    /**
     *
     */
    property: async (root, { input }, { auth }) => {
      auth.check();
      const { id } = input;
      const record = await Property.findOne({ _id: id, deleted: false });
      if (!record) throw new Error(`No property record found for ID ${id}.`);
      return record;
    },

    /**
     *
     */
    allProperties: (root, { pagination, sort }) => {
      const criteria = { deleted: false };
      return new Pagination(Property, { pagination, sort, criteria });
    },

    /**
     *
     */
    searchProperties: (root, { pagination, search }, { auth }) => {
      auth.check();
      const { typeahead } = search;
      const { criteria, sort } = TypeAhead.getCriteria(typeahead, { deleted: false });
      return new Pagination(Property, { criteria, pagination, sort });
    },
  },

  /**
   *
   */
  Mutation: {
    /**
     *
     */
    createProperty: (root, { input }, { auth }) => {
      auth.checkAdmin();
      const { payload } = input;
      const {
        name,
        key,
        baseVersion,
        userSource,
        stack,
      } = payload;
      const record = new Property({
        name,
        key,
        baseVersion,
        userSource,
        stack,
      });
      return record.save();
    },

    /**
     *
     */
    updateProperty: async (root, { input }, { auth }) => {
      auth.checkAdmin();
      const { id, payload } = input;
      const {
        name,
        key,
        baseVersion,
        userSource,
        stack,
      } = payload;
      const record = await Property.findOne({ _id: id, deleted: false });
      if (!record) throw new Error(`No property record found for ID ${id}.`);
      record.set({
        name,
        key,
        baseVersion,
        userSource,
        stack,
      });
      return record.save();
    },

    /**
     *
     */
    deleteProperty: async (root, { input }, { auth }) => {
      auth.checkAdmin();
      const { id } = input;
      const record = await Property.findOne({ _id: id });
      if (!record) throw new Error(`No property record found for ID ${id}.`);
      record.deleted = true;
      return record.save();
    },
  },
};
