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
    // Query Notion for database with "req.body.notionDatabase" in the title and extract database ID
    let notionDatabaseResults
    try {
      notionDatabaseResults = await axios.post('https://api.notion.com/v1/search', { 'query': req.body.notionDatabase }, notionRequestHeader);
    } catch (error) {
      res.json({'Error': error.response.data.message})
      return
    }
    let notionDatabaseId
    if (notionDatabaseResults.data.results.length == 0) {
      res.json({'Error': 'Notion - Database with name ' + req.body.notionDatabase + ' not found.' })
      return
    } else {
      notionDatabaseId = notionDatabaseResults.data.results[0].id
    }
    // Query pages from database with "req.body.notionDatabase" in the title
    const notionDatabasePages = await axios.post('https://api.notion.com/v1/databases/' + notionDatabaseId + '/query', {}, notionRequestHeader);
    let notionDatabasePageResults = notionDatabasePages.data.results
    // For each Notion page, get the title property and put results in array with page ID
    var notionPages = []
    for ( let i = 0; i < notionDatabasePageResults.length; i++ ) {
      const notionPageProperties = await axios.get('https://api.notion.com/v1/pages/' + notionDatabasePageResults[i].id + '/properties/title', notionRequestHeader);
      if (notionPageProperties.data.results[0]) {
        notionPages.push({
          title: notionPageProperties.data.results[0].title.plain_text,
          id: notionDatabasePageResults[i].id,
          isCompleted: notionDatabasePageResults[i].properties[''].checkbox
        })
      }
    }
    // Get label_id for "notion" label in Todoist
    const todoistLabels = await axios.get('https://api.todoist.com/rest/v1/labels', todoistRequestHeader);
    var notionLabelId
    for ( let k = 0; k < todoistLabels.data.length; k++ ) {
      if (todoistLabels.data[k].name == req.body.todoistLabel) {
        notionLabelId = todoistLabels.data[k].id
      }
    }
    // Get tasks from Todoist with the "notion" label
    const todoistTasks = await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + notionLabelId, todoistRequestHeader);
    // For each task from Todoist, if it does not already exist as a page in Notion then add as page to Notion database
    for ( let j = 0; j < todoistTasks.data.length; j++ ) {
      let isFound = false
      if (notionPages.length !== 0) {
        isFound = notionPages.some(element => {
          if (element.title == todoistTasks.data[j].content) {
            return true;
          }
        });
      }
      if (!isFound) {
        try {
          const notionCreatePageRes = await axios.post('https://api.notion.com/v1/pages',
          {
            "parent": { "database_id": notionDatabaseId },
            "properties": {
              "Tasks": {
                "title": [ { "text": { "content": todoistTasks.data[j].content } } ]
               }
            }
          }, notionRequestHeader);
        } catch (error) {
          res.json({'Error': error.response.data.message})
          return
        }
      }
    }
    // For each page in Notion, if task does not exist in Todoist, then remove page
    for (let i = 0; i < notionPages.length; i++) {
      let isFound = false
      if (todoistTasks.data.length !== 0) {
        isFound = todoistTasks.data.some(element => {
          if (element.content == notionPages[i].title) {
            return true;
          }
        });
      }
      if (!isFound) {
        try {
          const notionUpdatePageRes = await axios.patch('https://api.notion.com/v1/pages/' + notionPages[i].id,
          {
            "archived": true
          }, notionRequestHeader);
        } catch (error) {
          res.json({'Error': error.response.data.message})
          return
        }
      }
    }
    res.json({'Success': 'Successfully synced at ' + Date().toString()})
  }
});

module.exports = router;
