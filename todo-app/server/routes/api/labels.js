const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const auth = require('../../middleware/auth')

// Label model
const Label = require('../../models/Label');

// @route  GET api/labels
// @desc   Get user labels
// @access Private
router.get('/', auth, async (req, res) => {
  res.send(await Label.find({}));
});

// @route  POST api/labels
// @desc   Create a new label
// @access Private
router.post('/', auth, async (req, res) => {
  await Label.create({
    label_id: req.body.label_id,
    name:     req.body.name
  });
  res.status(201).send();
});

// @route  DELETE api/labels/:id
// @desc   Delete an existing label
// @access Private
router.delete('/:id', auth, async (req, res) => {
  await Label.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

module.exports = router;
