const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const axios = require('axios');
const auth = require('../../../middleware/auth')

// Setting model
const Setting = require('../../../models/Setting');

// @route  POST api/sync
// @desc   Sync any tasks in Todoist with the label "notion" to a database in Notion shared with integration with "tasks" in the title
// @access Private

router.post('/', auth, async (req, res) => {

  // Get API token configuration and throw error is missing
  let settings = await Setting.find({user_id: req.user.id})

  if (!settings[0].notion_api_token || !settings[0].todoist_api_token) {
    res.status(404).json({'Error': 'Missing Notion or Todoist API token'})
  } else {

    let todoistRequestHeader = {
      headers: {
        'Authorization': 'Bearer ' + settings[0].todoist_api_token
      }
    }

    let notionRequestHeader = {
      headers: {
        'Authorization': 'Bearer ' + settings[0].notion_api_token,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    }

    // Get labels from Todoist
    const todoistLabels = await axios.get('https://api.todoist.com/rest/v1/labels', todoistRequestHeader);
    // Find the label_id for notion in Todoist
    var notion_label_id
    for ( let i = 0; i < todoistLabels.data.length; i++ ) {
      if (todoistLabels.data[i].name == 'notion') {
        notion_label_id = todoistLabels.data[i].id
      }
    }

    const todoistTasks = await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + notion_label_id, todoistRequestHeader);

    // Query Notion for database IDs
    const notionDatabaseIds = await axios.post('https://api.notion.com/v1/search',
    {
      'query': 'paradone'
    },
    notionRequestHeader);
    let paradoneDatabaseId = notionDatabaseIds.data.results[0].id

    // Get pages in Notion database
    const databasePages = await axios.post('https://api.notion.com/v1/databases/' + paradoneDatabaseId + '/query',
    {},
    notionRequestHeader);

    let databasePageResults = databasePages.data.results

    var pageIds = []

    // get title property
    // For each result get the ttitle property and put in array
    for ( let i = 0; i < databasePageResults.length; i++ ) {

      const pageTitle = await axios.get('https://api.notion.com/v1/pages/' + databasePageResults[i].id + '/properties/title',
      notionRequestHeader);

      pageIds.push({title: pageTitle.data.results[0].title.plain_text, id: databasePageResults[i].id})
    }

    for ( let j = 0; j < todoistTasks.data.length; j++ ) {

      const isFound = pageIds.some(element => {
        if (element.title === todoistTasks.data[j].content) {
          return true;
        }
        return false;
      });

      if (!isFound) {
        const notionCreatePageRes = await axios.post('https://api.notion.com/v1/pages',
        {
          "parent": { "database_id": paradoneDatabaseId },
          "properties": {
      		"Name": {
      			"title": [ { "text": { "content": todoistTasks.data[j].content } } ]
      		 }
          }
        },
        notionRequestHeader);
      }

    }

  res.send(todoistTasks.data)

  }

});

module.exports = router;
