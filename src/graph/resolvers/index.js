const deepAssign = require('deep-assign');
const { DateType, CursorType } = require('../custom-types');

const property = require('./property');
const user = require('./user');
const taxonomy = require('./taxonomy');
const company = require('./company');

module.exports = deepAssign(property, user, taxonomy, company, {
  Date: DateType,
  Cursor: CursorType,
  /**
   *
   */
  Query: {
    /**
     *
     */
    ping: () => 'pong',
  },
});
