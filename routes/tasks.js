var express = require('express')
var router = express.Router()
var Task = require('../models/task')

// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/* Get tasks for a user */
router.get('/', function(req, res) {
  Task.find({username: req.user.username}, function(err, tasks) {
    if (!err) {
      res.json(tasks)
    } else {
      res.status(500).json([])
    }
  })
})

/* Create a new task */
// curl --header "Content-Type: application/json" --data '{"username": "paul", "content": "Another test taskasdfasdfasdf"}' localhost:8080/tasks
router.post('/', function(req, res) {
  var task_id = uuidv4()
  var newTask = new Task({
    username:     req.body.username,
    content:      req.body.content,
    task_id:      task_id,
    project_id:   req.body.project_id,
    section_id:   req.body.section_id,
    parent_id:    req.body.parent_id,
    label_ids:    req.body.label_ids,
    priority:     req.body.priority,
    order:        req.body.order,
    due_datetime: req.body.due_datetime,
  })
  newTask.save(function(err, data) {
    if (err) {
      res.json({success: false})
    } else {
      res.json({success: true})
    }
  })
})

/* Update a task */
// curl -X PUT -H "Content-Type: application/json" -d '{"task_id": "eb334f17-7c70-4486-801a-063a7ad08e2f", "completed": true}' localhost:8080/tasks
router.put('/', function(req, res) {
  Task.findOne({task_id: req.body.task_id}, function(err, task) {
    Task.findByIdAndUpdate(
      task.id,
      {
        username:     req.user.username,
        content:      req.body.content,
        project_id:   req.body.project_id,
        section_id:   req.body.section_id,
        parent_id:    req.body.parent_id,
        label_ids:    req.body.label_ids,
        priority:     req.body.priority,
        order:        req.body.order,
        due_datetime: req.body.due_datetime,
        completed:    req.body.completed
      },
      { new: true },
      function(err, update) {
        if (err == null) {
          res.json({Success: true})
        } else {
          res.json({Success: false})
        }
      }
    )
  })
})

module.exports = router
