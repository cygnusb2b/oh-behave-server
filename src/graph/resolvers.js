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

    property: async (root, { key }) => {
      const property = await Property.findOne({ key });
      if (!property) throw new Error(`No property found for key '${key}'`);
      return property;
    },
  },
};
