const { Schema } = require('mongoose');
const moment = require('moment-timezone');
const criteriaSchema = require('./content-query/criteria');
const pushId = require('unique-push-id');

const schema = new Schema({
  queryId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'content-query',
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
    default() {
      return pushId();
    },
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

schema.virtual('shortName').get(function getShortName() {
  const start = moment(this.startDate).tz('America/Chicago');
  const end = moment(this.endDate).tz('America/Chicago');
  if (this.sourceType === 'archive') {
    return `${start.format('YYYY-MM')} to ${end.format('YYYY-MM')}`;
  }
  return `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`;
});

schema.index({ deleted: 1 });
schema.index({ queryId: 1 });
schema.index({ ranAt: 1, _id: 1 }, { unique: true });
schema.index({ ranAt: -1, _id: -1 }, { unique: true });

module.exports = schema;
