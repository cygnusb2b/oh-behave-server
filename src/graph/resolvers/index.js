const deepAssign = require('deep-assign');
const { DateType, CursorType } = require('../custom-types');

const property = require('./property');
const user = require('./user');
const taxonomy = require('./taxonomy');
const company = require('./company');
const section = require('./section');
const contentQuery = require('./content-query');
const contentQueryResult = require('./content-query-result');
const contentQueryResultRow = require('./content-query-result-row');

module.exports = deepAssign(
  property,
  user,
  taxonomy,
  company,
  section,
  contentQuery,
  contentQueryResult,
  contentQueryResultRow,
  {
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
  },
);
