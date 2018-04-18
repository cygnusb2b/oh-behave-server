const { Schema } = require('mongoose');

const crtieriaSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['Taxonomy', 'Company', 'Section'],
  },
  ids: {
    type: [Number],
    required: true,
    validate: {
      validator(ids) {
        if (ids.length) return true;
        return false;
      },
      message: 'The model criteria IDs cannot be empty.',
    },
  },
});

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
    type: [crtieriaSchema],
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
