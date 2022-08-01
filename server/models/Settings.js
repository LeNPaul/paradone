const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const SettingSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  notion_api_token: {
    type: String
  },
  todoist_api_token: {
    type: String
  }
});

module.exports = Setting = mongoose.model('setting', SettingSchema);
