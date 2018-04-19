const { Schema } = require('mongoose');

module.exports = new Schema({
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
}, { _id: false });
