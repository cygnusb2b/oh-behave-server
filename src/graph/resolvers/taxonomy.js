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
    searchTaxonomy: (root, { propertyId, phrase }, { auth }) => {
      auth.check();
      return TaxonomyRepo.search(propertyId, phrase);
    },
  },
};
