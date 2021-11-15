const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const TaskSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  label: {
    type: String
  },
  priority: {
    type: String
  },
  project: {
    type: String
  }
});

module.exports = Task = mongoose.model('task', TaskSchema);
