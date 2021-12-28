const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
// Use the document ID as the task_id
const TaskSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  project_id: {
    type: String
  },
  section_id: {
    type: String
  },
  parent_id: {
    type: String
  },
  label_ids: {
    type: Array
  },
  priority: {
    type: String
  },
  order: {
    type: Number
  },
  due_datetime: {
    type: Date
  },
  completed: {
    type: Boolean
  }
});

module.exports = Task = mongoose.model('task', TaskSchema);
