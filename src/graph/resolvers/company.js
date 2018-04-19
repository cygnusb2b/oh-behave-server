const CompanyRepo = require('../../repos/company');

module.exports = {
  /**
   *
   */
  Company: {
    id: company => company._id,
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    searchCompanies: (root, { propertyId, phrase }, { auth }) => {
      auth.check();
      return CompanyRepo.search(propertyId, phrase);
    },
  },
};
