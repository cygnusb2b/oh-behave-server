const { Schema } = require('mongoose');

const schema = new Schema({
  key: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  version: {
    type: String,
    required: true,
    enum: ['3', '4'],
  },
});

schema.index({ name: 1 });
schema.index({ name: -1 });

module.exports = schema;
