const { graphql } = require('graphql');
const schema = require('../../src/graph/schema');


module.exports = {
  async graphql({ query, variables, key }) {
    return graphql({ schema, source: query, variableValues: variables }).then((response) => {
      if (response.errors) throw response.errors[0];
      return response.data[key];
    });
  },
};
