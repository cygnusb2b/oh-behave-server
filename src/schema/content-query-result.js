const { Schema } = require('mongoose');
const criteriaSchema = require('./content-query/criteria');

const schema = new Schema({
  queryId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'content-query',
  },
  criteria: {
    // A cloned copy of the query's criteria for history.
    type: [criteriaSchema],
    required: true,
  },
  baseVersion: {
    type: String,
    required: true,
  },
  userSource: {
    type: String,
    required: true,
  },
  sourceType: {
    type: String,
    required: true,
    enum: ['latest', 'archive'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  contentCount: {
    type: Number,
    required: true,
    default: 0,
  },
  contentViews: {
    type: Number,
    required: true,
    default: 0,
  },
  userCount: {
    type: Number,
    required: true,
    default: 0,
  },
  foundUserCount: {
    type: Number,
    required: true,
    default: 0,
  },
  ranAt: {
    type: Date,
    required: true,
  },
  ranById: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

schema.index({ deleted: 1 });
schema.index({ queryId: 1 });
schema.index({ ranAt: 1, _id: 1 }, { unique: true });
schema.index({ ranAt: -1, _id: -1 }, { unique: true });

module.exports = schema;
