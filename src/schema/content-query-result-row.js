const { Schema } = require('mongoose');

const schema = new Schema({
  resultId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'content-query-result',
  },
  sourceId: {
    type: Schema.Types.ObjectId,
  },
  email: {
    type: String,
  },
});

schema.index({ resultId: 1 });
schema.index({ email: 1, _id: 1 }, { unique: true });
schema.index({ email: -1, _id: -1 }, { unique: true });

module.exports = schema;
