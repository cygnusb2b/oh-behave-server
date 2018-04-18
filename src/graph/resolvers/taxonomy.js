const TaxonomyRepo = require('../../repos/taxonomy');

module.exports = {
  /**
   *
   */
  Taxonomy: {
    id: taxonomy => taxonomy._id,
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    searchTaxonomy: (root, { property, phrase }, { auth }) => {
      auth.check();
      return TaxonomyRepo.search(property, phrase);
    },
  },
};
