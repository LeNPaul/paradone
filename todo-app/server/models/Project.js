const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProjectSchema = new Schema({
  project_name: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  }
});

module.exports = Project = mongoose.model('project', ProjectSchema);
