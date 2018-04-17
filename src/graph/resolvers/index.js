const deepAssign = require('deep-assign');
const { DateType, CursorType } = require('../custom-types');

const property = require('./property');
const user = require('./user');

module.exports = deepAssign(property, user, {
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
