const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
// Use the document ID as the project_id
const ProjectSchema = new Schema({
  project_name: {
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
  },
  archived: {
    type: Boolean
  }
});

module.exports = Project = mongoose.model('project', ProjectSchema);
