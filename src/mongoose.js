const mongoose = require('mongoose');
const bluebird = require('bluebird');

const { MONGO_DSN } = process.env;
mongoose.Promise = bluebird;

mongoose.connect(MONGO_DSN, {
  // autoIndex: process.env.NODE_ENV !== 'production',
  ignoreUndefined: true,
  promiseLibrary: bluebird,
}).then(() => {
  process.stdout.write(`Successful Mongoose connection to '${MONGO_DSN}'\n`);
  return mongoose;
});

module.exports = mongoose;
