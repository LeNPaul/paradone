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

// @route  PUT api/settings
// @desc   Update existing settings
// @access Private
router.put('/', auth, async (req, res) => {
  const settings = {
    notion_api_token: req.body.notion_api_token,
    todoist_api_token: req.body.todoist_api_token,
    user_id: req.user.id
  }
  console.log(settings)
  const updatedSettings = await Setting.findOneAndUpdate(
    { user_id: req.user.id },
    { $set: settings }
  );
  settings._id = updatedSettings._id;
  res.status(200).send(settings);
});

module.exports = router;
