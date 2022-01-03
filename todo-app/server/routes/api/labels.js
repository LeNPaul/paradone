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

// @route  GET api/labels/:id
// @desc   Get user label by id
// @access Private
router.get('/:id', auth, async (req, res) => {
  const label = await Label.findOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send(label);
});

// @route  POST api/labels
// @desc   Create a new label
// @access Private
router.post('/', auth, async (req, res) => {
  const insertedLabel = await Label.create({
    user_id:  req.user.id,
    label_name: req.body.label_name
  });
  label._id = insertedLabel._id
  res.status(201).send(label);
});

// @route  DELETE api/labels/:id
// @desc   Delete an existing label
// @access Private
router.delete('/:id', auth, async (req, res) => {
  await Label.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

module.exports = router;
