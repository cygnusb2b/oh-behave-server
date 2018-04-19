const SectionRepo = require('../../repos/section');

module.exports = {
  /**
   *
   */
  Section: {
    id: section => section._id,
    alias: section => section.alias || 'none',
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    searchSections: (root, { property, phrase }, { auth }) => {
      auth.check();
      return SectionRepo.search(property, phrase);
    },
  },
};
