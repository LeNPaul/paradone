const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const auth = require('../../middleware/auth');

// Task model
const Task = require('../../models/Task');

// @route  POST api/tasks
// @desc   Create a new task
// @access Private
router.post('/', auth, async (req, res) => {
    // TODO: Can you pass req.body directly into the database?
    const task = {
      user_id:    req.user.id,
      content:    req.body.content,
      label_ids:  req.body.label_ids,
      priority:   req.body.priority,
      project_id: req.body.project_id
    }
    const insertedTask = await Task.create(task);
    task._id = insertedTask._id;
    res.status(201).send(task);
  });

module.exports = router;
