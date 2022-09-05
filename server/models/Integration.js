const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const IntegrationSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  source_query: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  destination_modifier: {
    type: String,
    required: true
  }
});

module.exports = Integration = mongoose.model('integration', IntegrationSchema);

/*
Todoist label
Notion database name
Sync Todoist with Notion
Sync Notion with Todoist

For every task in Todoist with with the label _____
Create a new page in Notion in the _____ database

*/
