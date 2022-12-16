const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const auth = require('../../middleware/auth');

// Task model
const Task = require('../../models/Task');

// @route  GET api/tasks
// @desc   Get user tasks
// @access Private
router.get('/', auth, async (req, res) => {
  res.send(await Task.find({user_id: req.user.id}));
});

// @route  GET api/tasks/:id
// @desc   Get a user task by id
// @access Private
router.get('/:id', auth, async (req, res) => {
  res.send(await Task.findOne({ _id: new mongodb.ObjectID(req.params.id) }));
});

// @route  POST api/tasks
// @desc   Create a new task
// @access Private
router.post('/', auth, async (req, res) => {
    // TODO: Can you pass req.body directly into the database?
    const task = {
      user_id: req.user.id,
      title:   req.body.title,
      content: req.body.content
    }
    const insertedTask = await Task.create(task);
    task._id = insertedTask._id;
    res.status(201).send(task);
  });

// @route  PUT api/tasks/:id
// @desc   Update an existing task
// @access Private
router.put('/:id', auth, async (req, res) => {
  const task = {
    user_id:    req.user.id,
    content:    req.body.content,
    completed:  req.body.completed
  }
  const updatedTask = await Task.findOneAndUpdate(
    { _id: new mongodb.ObjectID(req.params.id) },
    { $set: task }
  );
  task._id = updatedTask._id;
  res.send(task);
});

// @route  DELETE api/tasks/:id
// @desc   Delete an existing task
// @access Private
router.delete('/:id', auth, async (req, res) => {
  res.send(await Task.deleteOne({ _id: new mongodb.ObjectID(req.params.id) }));
});

module.exports = router;

// TODO: Find best way to do error handling with HTTP response codes, and what should be returned from db query
//       Set the await to a variable, and depending on the response, send back correct code - test this with incorrect values