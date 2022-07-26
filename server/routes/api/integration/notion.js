const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const axios = require('axios');
const auth = require('../../../middleware/auth')

// @route  GET api/subscriptions
// @desc   Get user subscriptions
// @access Private
router.post('/', auth, async (req, res) => {
  const todoistRes = await axios.get('https://api.todoist.com/rest/v1/tasks', {
    headers: {
      'Authorization': 'Bearer ' + req.body.token
    }
  });
  res.send(todoistRes.data);
});

module.exports = router;
