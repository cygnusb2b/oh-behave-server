require('../connections');
const { graphql } = require('./utils');

describe('graph/resolvers', function() {
  describe('Query', function() {

    describe('ping', function() {
      const query = `
        query Ping {
          ping
        }
      `;
      it('should pong.', async function() {
        const data = await graphql({ query, key: 'ping' });
        expect(data).to.equal('pong');
      });
    });

    describe('allProperties', function() {
      const query = `
        query AllProperties {
          allProperties {
            key
            name
            version
          }
        }
      `;
      it('should return the configured Properties.', async function() {
        const data = await graphql({ query, key: 'allProperties' });
        expect(data).to.be.an('array');
      });
    });

    describe('property', function() {
      const query = `
        query Property($key: String!) {
          property(key: $key) {
            key
            name
            version
          }
        }
      `;
      it('should reject when the key is not provided.', async function() {
        const variables = {};
        await expect(graphql({ query, key: 'property', variables })).to.be.rejectedWith(Error, /required type/i);
      });
      it('should reject when the property does not exist.', async function() {
        const key = 'this does not exist';
        const variables = { key };
        await expect(graphql({ query, key: 'property', variables })).to.be.rejectedWith(Error, /no property found/i);
      });
    });

  });
});
