require('../connections');
const Property = require('../../src/models/property');
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

      const property = new Property({ key: 'test', name: 'Test Property', version: '3' });
      before(async function() {
        await Property.remove();
        await property.save();
      });

      after(function() {
        return Property.remove();
      });

      it('should return the configured Properties.', async function() {
        const data = await graphql({ query, key: 'allProperties' });
        expect(data).to.be.an('array');
        const prop = data[0];
        expect(prop.key).to.equal(property.key);
        expect(prop.name).to.equal(property.name);
        expect(prop.version).to.equal(property.version);
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

      const property = new Property({ key: 'test', name: 'Test Property', version: '3' });
      before(async function() {
        await Property.remove();
        await property.save();
      });

      after(function() {
        return Property.remove();
      });
      it('should return requested property.', async function() {
        const key = property.key;
        const variables = { key };
        const promise = graphql({ query, key: 'property', variables });
        await expect(promise).to.eventually.be.an('object');
        const prop = await promise;

        expect(prop.key).to.equal(property.key);
        expect(prop.name).to.equal(property.name);
        expect(prop.version).to.equal(property.version);
      });
    });

  });
});
