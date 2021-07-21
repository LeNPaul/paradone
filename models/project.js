var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Project = new Schema({
  username:     String,
  project_name: String,
  project_id:   String,
  colour:       String,
  order:        Number,
  archived:     Boolean
});

Project.plugin(passportLocalMongoose);

module.exports = mongoose.model('Project', Project);
