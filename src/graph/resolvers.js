const Property = require('../models/property');

module.exports = {
  /**
   *
   */
  Query: {
    /**
     *
     */
    ping: () => 'pong',

    allProperties: (root, { sort }) => {
      const { field, order } = sort;
      return Property.find().sort({ [field]: order });
    },

    property: async (root, { id }) => {
      const property = await Property.findOne({ _id: id });
      if (!property) throw new Error(`No property found for ID '${id}'`);
      return property;
    },
  },
};
