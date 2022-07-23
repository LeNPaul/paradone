const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const axios = require('axios');
const auth = require('../../../middleware/auth')

// @route  GET api/subscriptions
// @desc   Get user subscriptions
// @access Private
//router.get('/', auth, async (req, res) => {
router.get('/', async (req, res) => {
  const todoistRes = await axios.get('https://api.todoist.com/rest/v1/projects', {
    headers: {
      'Authorization': 'Bearer '
    }
  });
  console.log(todoistRes)
  res.send('Hello World!');
});

module.exports = router;
