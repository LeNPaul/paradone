var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Task = new Schema({
  username:     String,
  content:      String,
  task_id:      String,
  project_id:   String,
  section_id:   String,
  parent_id:    String,
  label_ids:    Array,
  priority:     Number,
  order:        Number,
  due_datetime: Date,
  completed:    Boolean
});

Task.plugin(passportLocalMongoose);

module.exports = mongoose.model('Task', Task);
