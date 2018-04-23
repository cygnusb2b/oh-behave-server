const { Schema } = require('mongoose');

const schema = new Schema({
  resultId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'content-query-result',
  },
  exportedById: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  exportedAt: {
    type: Date,
    required: true,
  },
});

schema.index({ exportedAt: 1, _id: 1 }, { unique: true });
schema.index({ exportedAt: -1, _id: -1 }, { unique: true });

module.exports = schema;
