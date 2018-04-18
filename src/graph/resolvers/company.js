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
    searchCompanies: (root, { property, phrase }, { auth }) => {
      auth.check();
      return CompanyRepo.search(property, phrase);
    },
  },
};
