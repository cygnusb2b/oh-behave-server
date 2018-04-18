const deepAssign = require('deep-assign');
const { DateType, CursorType } = require('../custom-types');

const property = require('./property');
const user = require('./user');
const taxonomy = require('./taxonomy');

module.exports = deepAssign(property, user, taxonomy, {
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
