const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const LabelSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  label_id: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = Label = mongoose.model('label', LabelSchema);
