const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// curl -d '{"projectName": "work"}' -H 'Content-Type: application/json' http://127.0.0.1:5050/api/projects

// Get Projects
router.get('/', async (req, res) => {
  const projects = await loadProjectsCollection();
  res.send(await projects.find({}).toArray());
});

// Add Project
router.post('/', async (req, res) => {
  const projects = await loadProjectsCollection();
  await projects.insertOne({
    userName:    req.body.userName,
    projectName: req.body.projectName,
    projectId:   req.body.projectId,
    colour:      req.body.colour,
    order:       req.body.order,
    archived:    req.body.archived
  });
  res.status(201).send();
});

// Delete Project
router.delete('/:id', async (req, res) => {
  const projects = await loadProjectsCollection();
  await projects.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

async function loadProjectsCollection() {
  const client = await mongodb.MongoClient.connect(
    'mongodb://localhost', {
    useNewUrlParser: true
  });
  return client.db('todo-app-backend').collection('projects');
}

module.exports = router;
