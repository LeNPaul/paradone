const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');

// Project model
const Project = require('../../models/Project');

// @route  GET api/projects
// @desc   Get user projects
// @access Private
router.get('/', async (req, res) => {
  res.send(await Project.find({}));
});

// @route  POST api/projects
// @desc   Create a new project
// @access Private
router.post('/', async (req, res) => {
  const project = {
    name:  req.body.name
  }
  const insertedProject = await Project.create(project);
  project._id = insertedProject._id;
  res.status(201).send(project);
});

// @route  PUT api/projects/:id
// @desc   Update an existing project
// @access Private
router.put('/:id', async (req, res) => {
  const project = {
    name: req.body.name
  }
  const updatedProject = await Project.findOneAndUpdate(
    { name: req.params.id },
    { $set: project }
  );
  project._id = updatedProject._id;
  res.status(200).send(project);
});

// @route  DELETE api/projects/:id
// @desc   Delete an existing project
// @access Private
router.delete('/:id', async (req, res) => {
  await Project.deleteOne({ name: req.params.id });
  res.status(200).send({});
});

module.exports = router;
