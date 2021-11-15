const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');

// Label model
const Label = require('../../models/Label');

// @route  GET api/labels
// @desc   Get user labels
// @access Private
router.get('/', async (req, res) => {
  res.send(await Label.find({}));
});

// @route  POST api/labels
// @desc   Create a new label
// @access Private
router.post('/', async (req, res) => {
  await Label.create({
    label_id: req.body.label_id,
    name:     req.body.name
  });
  res.status(201).send();
});

// @route  DELETE api/labels/:id
// @desc   Delete an existing label
// @access Private
router.delete('/:id', async (req, res) => {
  await Label.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

module.exports = router;
