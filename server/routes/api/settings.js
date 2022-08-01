const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

// Setting model
const Setting = require('../../models/Setting');

// @route  GET api/settings
// @desc   Get user settings
// @access Private
router.get('/', auth, async (req, res) => {
  res.send(await Setting.find({user_id: req.user.id}));
});

// @route  POST api/settings
// @desc   Create a new
// @access Private
router.post('/', auth, async (req, res) => {
  console.log(req.body)
  const settings = {
    notion_api_token: req.body.notion_api_token,
    todoist_api_token: req.body.todoist_api_token,
    user_id: req.user.id
  }
  const insertedSettings = await Setting.create(settings);
  settings._id = insertedSettings._id;
  res.status(201).send(settings);
});

module.exports = router;
