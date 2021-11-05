const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// curl -d '{"content": "hello world!"}' -H 'Content-Type: application/json' http://127.0.0.1:5050/api/labels

// Get Labels
router.get('/', async (req, res) => {
  const labels = await loadLabelsCollection();
  res.send(await labels.find({}).toArray());
});

// Add Label
router.post('/', async (req, res) => {
  const labels = await loadLabelsCollection();
  await labels.insertOne({
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
  const labels = await loadLabelsCollection();
  await labels.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

async function loadLabelsCollection() {
  const client = await mongodb.MongoClient.connect(
    'mongodb://localhost', {
    useNewUrlParser: true
  });
  return client.db('todo-app-backend').collection('labels');
}

module.exports = router;
