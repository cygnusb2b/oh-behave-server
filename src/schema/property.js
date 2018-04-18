const { Schema } = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  baseVersion: {
    type: String,
    required: true,
    enum: ['3', '4'],
  },
  userSource: {
    type: String,
    required: true,
    enum: ['Merrick', 'Components', 'Radix'],
  },
}, {
  timestamps: true,
});

schema.index({ deleted: 1 });
schema.index({ key: 1 }, {
  unique: true,
  partialFilterExpression: { deleted: false },
});
schema.index({ name: 1, _id: 1 }, { unique: true });
schema.index({ name: -1, _id: -1 }, { unique: true });
schema.index({ updatedAt: 1, _id: 1 }, { unique: true });
schema.index({ updatedAt: -1, _id: -1 }, { unique: true });

module.exports = schema;
