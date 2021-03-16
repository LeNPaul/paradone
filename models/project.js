var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Project = new Schema({
  name:       String,
  colour:     String,
  order:      Number,
  project_id: String
});

Project.plugin(passportLocalMongoose);

module.exports = mongoose.model('Project', Project);
