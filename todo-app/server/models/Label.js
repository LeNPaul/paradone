const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
// Use the document ID as the label_id
const LabelSchema = new Schema({
  label_name: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  colour: {
    type: String
  },
  order: {
    type: Number
  }
});

module.exports = Label = mongoose.model('label', LabelSchema);
