const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// curl -d '{"content": "hello world!"}' -H 'Content-Type: application/json' http://127.0.0.1:5050/api/tasks

// Get Tasks
router.get('/', async (req, res) => {
  const tasks = await loadTasksCollection();
  res.send(await tasks.find({}).toArray());
});

// Add Task
router.post('/', async (req, res) => {
  const tasks = await loadTasksCollection();
  await tasks.insertOne({
    userName:    req.body.userName,
    content:     req.body.content,
    taskId:      req.body.taskId,
    projectId:   req.body.projectId,
    sectionId:   req.body.sectionId,
    parentId:    req.body.parentId,
    labelIds:    req.body.labelIds,
    priority:    req.body.priority,
    order:       req.body.order,
    dueDateTime: req.body.dueDateTime,
    completed:   req.body.completed
  });
  res.status(201).send();
});

// Delete Task
router.delete('/:id', async (req, res) => {
  const tasks = await loadTasksCollection();
  await tasks.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

async function loadTasksCollection() {
  const client = await mongodb.MongoClient.connect(
    'mongodb://localhost', {
    useNewUrlParser: true
  });
  return client.db('todo-app-backend').collection('tasks');
}

module.exports = router;
