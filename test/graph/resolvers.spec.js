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
            id
            name
            version
          }
        }
      `;

      const property = new Property({ name: 'Test Property', version: '3' });
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
        expect(prop.id).to.equal(property.id);
        expect(prop.name).to.equal(property.name);
        expect(prop.version).to.equal(property.version);
      });
    });

    describe('property', function() {
      const query = `
        query Property($id: String!) {
          property(id: $id) {
            id
            name
            version
          }
        }
      `;
      it('should reject when the id is not provided.', async function() {
        const variables = {};
        await expect(graphql({ query, key: 'property', variables })).to.be.rejectedWith(Error, /required type/i);
      });
      it('should reject when the property does not exist.', async function() {
        const id = '5410f4f507f3a09970ac8e2e';
        const variables = { id };
        await expect(graphql({ query, key: 'property', variables })).to.be.rejectedWith(Error, /no property found/i);
      });

      const property = new Property({ name: 'Test Property', version: '3' });
      before(async function() {
        await Property.remove();
        await property.save();
      });

      after(function() {
        return Property.remove();
      });
      it('should return requested property.', async function() {
        const id = property.id;
        const variables = { id };
        const promise = graphql({ query, key: 'property', variables });
        await expect(promise).to.eventually.be.an('object');
        const prop = await promise;

        expect(prop.id).to.equal(property.id);
        expect(prop.name).to.equal(property.name);
        expect(prop.version).to.equal(property.version);
      });
    });

  });
});
