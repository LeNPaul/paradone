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
  parent_ids: {
    type: Array
  },
  tag_ids: {
    type: Array
  },
  due_datetime: {
    type: Date
  },
  completed: {
    type: Boolean
  }
});

module.exports = Task = mongoose.model('task', TaskSchema);

// TODO: Update schema to have title and content, and then is_completed