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
    // Query Notion for database with "paradone" in the title and extract database ID
    // TODO: remove hardcoding of "paradone"
    const notionDatabaseResults = await axios.post('https://api.notion.com/v1/search', { 'query': 'paradone' }, notionRequestHeader);
    let notionDatabaseId = notionDatabaseResults.data.results[0].id
    // Query pages from database with "paradone" in the title
    const notionDatabasePages = await axios.post('https://api.notion.com/v1/databases/' + notionDatabaseId + '/query', {}, notionRequestHeader);
    let notionDatabasePageResults = notionDatabasePages.data.results
    // For each Notion page, get the title property and put results in array with page ID
    var notionPages = []
    for ( let i = 0; i < notionDatabasePageResults.length; i++ ) {
      const notionPageProperties = await axios.get('https://api.notion.com/v1/pages/' + notionDatabasePageResults[i].id + '/properties/title', notionRequestHeader);
      notionPages.push({title: notionPageProperties.data.results[0].title.plain_text, id: notionDatabasePageResults[i].id})
    }
    // Get label_id for "notion" label in Todoist
    // TODO: remove hardcoding of "notion" label name
    const todoistLabels = await axios.get('https://api.todoist.com/rest/v1/labels', todoistRequestHeader);
    var notionLabelId
    for ( let i = 0; i < todoistLabels.data.length; i++ ) {
      if (todoistLabels.data[i].name == 'notion') {
        notionLabelId = todoistLabels.data[i].id
      }
    }
    // Get tasks from Todoist with the "notion" label
    const todoistTasks = await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + notionLabelId, todoistRequestHeader);
    // For each task from Todoist, if it does not already exist as a page in Notion then add as page to Notion database
    for ( let j = 0; j < todoistTasks.data.length; j++ ) {
      const isFound = notionPages.some(element => {
        if (element.title === todoistTasks.data[j].content) {
          return true;
        }
        return false;
      });
      if (!isFound) {
        const notionCreatePageRes = await axios.post('https://api.notion.com/v1/pages',
        {
          "parent": { "database_id": notionDatabaseId },
          "properties": {
      		"Name": {
      			"title": [ { "text": { "content": todoistTasks.data[j].content } } ]
      		 }
          }
        }, notionRequestHeader);
      }
    }
    res.json({'Success': 'Successfully synced at ' + Date().toString()})
  }
});

module.exports = router;
