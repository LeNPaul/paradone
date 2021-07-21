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

/* Get projects for a user */
router.get('/', function(req, res) {
  Project.find({username: req.user.username}, function(err, projects) {
    if (!err) {
      res.json(projects)
    } else {
      res.status(500).json({success: false})
    }
  })
})

/* Create a new project */
// curl --header "Content-Type: application/json" --data '{"name": "test"}' localhost:8080/projects
router.post('/', function(req, res) {
  var project_id = uuidv4()
  var newProject = new Project({
    username:     req.user.username,
    project_name: req.body.project_name,
    project_id:   project_id
  })
  newProject.save(function(err, data) {
    if (err) {
      res.status(500).json({success: false})
    } else {
      res.json({success: true})
    }
  })
})

/* Update a project */
// curl -X PUT -H "Content-Type: application/json" -d '{"project_id": "", "project_name": "renamed"}' localhost:8080/projects
router.put('/', function(req, res) {
  Project.findOne({project_id: req.body.project_id}, function(err, project) {
    Project.findByIdAndUpdate(
      project.id,
      req.body,
      { new: true },
      function(err, update) {
        if (err == null) {
          res.json({Success: true})
        } else {
          res.status(500).json({success: false})
        }
      }
    )
  })
})

router.get('/:project', (req, res) => {
    res.render('projects.pug', {
      user : req.user,
      project : req.params.project,
      title : 'Project'
     });
});

module.exports = router
