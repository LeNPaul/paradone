var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Task = new Schema({
    username:  String,
    content:   String,
    due:       Date,
    completed: Boolean
});

Task.plugin(passportLocalMongoose);

module.exports = mongoose.model('Task', Task);
