const deepAssign = require('deep-assign');
const { DateType, CursorType } = require('../custom-types');

const property = require('./property');
const user = require('./user');
const taxonomy = require('./taxonomy');
const company = require('./company');
const section = require('./section');
const contentQuery = require('./content-query');

module.exports = deepAssign(property, user, taxonomy, company, section, contentQuery, {
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
