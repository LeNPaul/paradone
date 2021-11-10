const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// curl -d '{"name": "personal"}' -H 'Content-Type: application/json' http://127.0.0.1:5000/api/projects

// Get Projects
router.get('/', async (req, res) => {
  const projects = await loadProjectsCollection();
  res.send(await projects.find({}).toArray());
});

// Add Project
router.post('/', async (req, res) => {
  const projects = await loadProjectsCollection();
  const project = {
    name:  req.body.name
  }
  const insertedProject = await projects.insertOne(project);
  project._id = insertedProject.insertedId;
  res.status(201).send(project);
});

// Update Project
router.put('/:id', async (req, res) => {
  const projects = await loadProjectsCollection();
  const project = {
    name: req.body.name
  }
  const updatedProject = await projects.findOneAndUpdate(
    { name: req.params.id },
    { $set: project }
  );
  project._id = updatedProject.insertedId;
  res.status(200).send(project);
});

// Delete Project
router.delete('/:id', async (req, res) => {
  const projects = await loadProjectsCollection();
  await projects.deleteOne({ name: req.params.id });
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
