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

    allProperties: (root, { sort }) => Property.find(sort),

    property: async (root, { key }) => {
      const property = await Property.findOne({ key });
      if (!property) throw new Error(`No property found for key '${key}'`);
      return property;
    },
  },
};
