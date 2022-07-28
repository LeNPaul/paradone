const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const axios = require('axios');
const auth = require('../../../middleware/auth')

// @route  GET api/subscriptions
// @desc   Get user subscriptions
// @access Private
router.post('/', auth, async (req, res) => {
  const todoistRes = await axios.post('https://api.notion.com/v1/search',
  {
    'query': 'Scratchpad',
    'sort': {
      'direction': 'ascending',
      'timestamp': 'last_edited_time'
    }
  },
  {
    headers: {
      'Authorization': 'Bearer ' + req.body.token,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },

  });
  console.log(todoistRes.data.results)
  res.send(todoistRes.data);
});

module.exports = router;
