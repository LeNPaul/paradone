const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// curl -d '{"content": "hello world!", "label": "Doing", "priority": "1", "project": "personal"}' -H 'Content-Type: application/json' http://127.0.0.1:5050/api/tasks

// Get Tasks
router.get('/', async (req, res) => {
  let filter = {}
  if(req.query.project) {
    filter = {project: req.query.project}
  }
  const tasks = await loadTasksCollection();
  res.send(await tasks.find(filter).toArray());
});

// Add Task
router.post('/', async (req, res) => {
  const tasks = await loadTasksCollection();
  await tasks.insertOne({
    content:  req.body.content,
    label:    req.body.label,
    priority: req.body.priority,
    project:  req.body.project
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
