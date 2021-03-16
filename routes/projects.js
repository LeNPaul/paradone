var express = require('express')
var router = express.Router()
var Project = require('../models/project')

// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/* Create a new project */
// curl --header "Content-Type: application/json" --data '{"name": "test"}' localhost:8080/projects
router.post('/', function(req, res) {
  var project_id = uuidv4()
  var newProject = new Project({
    name:     req.body.name,
    project_id: project_id
  })
  newProject.save(function(err, data) {
    if (err) {
      res.json({success: false})
    } else {
      res.json({success: true})
    }
  })
})

module.exports = router
