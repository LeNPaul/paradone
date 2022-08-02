const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const axios = require('axios');
const auth = require('../../../middleware/auth')

// Setting model
const Setting = require('../../../models/Setting');

// @route  GET api/subscriptions
// @desc   Get user subscriptions
// @access Private

router.post('/', auth, async (req, res) => {

  // Get API token configuration and throw error is missing
  let settings = await Setting.find({user_id: req.user.id})

  if (!settings[0].notion_api_token || !settings[0].todoist_api_token) {
    res.status(404).json({'Error': 'Missing Notion or Todoist API token'})
  } else {

    // Get labels from Todoist
    const todoistLabels = await axios.get('https://api.todoist.com/rest/v1/labels', {
      headers: {
        'Authorization': 'Bearer ' + settings[0].todoist_api_token
      }
    });
    // Find the label_id for notion in Todoist
    var notion_label_id
    for ( let i = 0; i < todoistLabels.data.length; i++ ) {
      if (todoistLabels.data[i].name == 'notion') {
        notion_label_id = todoistLabels.data[i].id
      }
    }

    const todoistTasks = await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + notion_label_id, {
      headers: {
        'Authorization': 'Bearer ' + settings[0].todoist_api_token
      }
    });

    res.send(todoistTasks.data)

    // Query Notion for database IDs

  /*
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
  */

  }

});

module.exports = router;
