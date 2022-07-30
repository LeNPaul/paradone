const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const axios = require('axios');
const auth = require('../../../middleware/auth')

// @route  GET api/subscriptions
// @desc   Get user subscriptions
// @access Private

router.post('/', auth, async (req, res) => {

  // Get labels
  const todoistLabels = await axios.get('https://api.todoist.com/rest/v1/labels', {
    headers: {
      'Authorization': 'Bearer ' + req.body.todoistToken
    }
  });
  // Find the label_id for notion
  var notion_label_id
  for ( let i = 0; i < todoistLabels.data.length; i++ ) {
    if (todoistLabels.data[i].name == 'notion') {
      notion_label_id = todoistLabels.data[i].id
    }
  }

  const todoistTasks = await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + notion_label_id, {
    headers: {
      'Authorization': 'Bearer ' + req.body.todoistToken
    }
  });

  for ( let j = 0; j < todoistTasks.data.length; j++ ) {
    const notionCreatePageRes = await axios.post('https://api.notion.com/v1/pages',
    {
      "parent": { "database_id": "eb1b9a99-e313-4830-b520-25d52c6bf77e" },
      "properties": {
  		"Name": {
  			"title": [ { "text": { "content": todoistTasks.data[j].content } } ]
  		 }
      }
    },
    {
      headers: {
        'Authorization': 'Bearer ' + req.body.notionToken,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },

    });
  }

  res.send(todoistTasks.data);

});

module.exports = router;
