const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// curl -d '{"label_id": "done", "name": "Done"}' -H 'Content-Type: application/json' http://127.0.0.1:5000/api/labels

// Get Labels
router.get('/', async (req, res) => {
  const labels = await loadLabelsCollection();
  res.send(await labels.find({}).toArray());
});

// Add Label
router.post('/', async (req, res) => {
  const labels = await loadLabelsCollection();
  await labels.insertOne({
    label_id: req.body.label_id,
    name:     req.body.name
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
