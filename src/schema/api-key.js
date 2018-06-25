const { Schema } = require('mongoose');
const uuid = require('uuid/v4');

const schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default() {
      return uuid();
    },
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
});

schema.index({ userId: 1 });

module.exports = schema;
