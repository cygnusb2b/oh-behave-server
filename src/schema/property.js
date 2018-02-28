const { Schema } = require('mongoose');

const schema = new Schema({
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
