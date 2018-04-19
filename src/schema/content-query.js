const { Schema } = require('mongoose');
const criteriaSchema = require('./content-query/criteria');

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'property',
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  criteria: {
    type: [criteriaSchema],
    required: true,
  },
  createdById: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  updatedById: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
}, {
  timestamps: true,
});

schema.index({ deleted: 1 });
schema.index({ name: 1, _id: 1 }, { unique: true });
schema.index({ name: -1, _id: -1 }, { unique: true });
schema.index({ updatedAt: 1, _id: 1 }, { unique: true });
schema.index({ updatedAt: -1, _id: -1 }, { unique: true });

module.exports = schema;
