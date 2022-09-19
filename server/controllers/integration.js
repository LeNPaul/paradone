const Integration = require('../models/Integration');
const Setting = require('../models/Setting');
const Todoist = require('./todoist')
const nodeCron = require("node-cron");
const axios = require('axios');

// Get integration settings
// Get user settings
// Prepare source integration (i.e. get the right resources and call the right endpoints)
// Prepare destination integration (i.e. get the right resources and call the right endpoints)

// TODO: create a class/object for user integration that is initialized based on what the integration is and with methods to get the required information and to work on the integration
let run = function() {
  const job = nodeCron.schedule("0 * * * * *", () => {
    Integration.find({ is_active: true }).then(activeIntegrations => {
      // For each integration, find user settings using userID
      for (let i = 0 ; i < activeIntegrations.length ; i++) {
        // Create object for each active integration
        let activeIntegration = {}
        let todoist = new Todoist()
        // Populate object with integration settings for active integration
        activeIntegration.userId = activeIntegrations[i].user_id
        activeIntegration.source = activeIntegrations[i].source
        activeIntegration.source_query = activeIntegrations[i].source_query
        activeIntegration.destination = activeIntegrations[i].destination
        activeIntegration.destination_modifier = activeIntegrations[i].destination_modifier

        // Populate object with user settings
        Setting.find({user_id: activeIntegration.userId})
        .then(userSettings => {;
          if(userSettings[0].notion_api_token && userSettings[0].todoist_api_token) {
            activeIntegration.todoistRequestHeader = {
              headers: {
                'Authorization': 'Bearer ' + userSettings[0].todoist_api_token
              }
            }
            activeIntegration.notionRequestHeader = {
              headers: {
                'Authorization': 'Bearer ' + userSettings[0].notion_api_token,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
              }
            }
            todoist.initialize(userSettings[0].todoist_api_token)
          }
        })
        .then(async () => {
          // Query Notion for database with "req.body.notionDatabase" in the title and extract database ID
          await axios.post('https://api.notion.com/v1/search', { 'query': activeIntegration.destination_modifier }, activeIntegration.notionRequestHeader)
          .then(notionDatabaseResults => {
            if (notionDatabaseResults.data.results.length == 0) {
              console.log({'Error': 'Notion - Database with name ' + activeIntegration.destination_modifier + ' not found.' })
              return
            } else {
              activeIntegration.notionDatabaseId = notionDatabaseResults.data.results[0].id
            }
          })
        })
        .then(async () => {
          // Query pages from database with "req.body.notionDatabase" in the title
          await axios.post('https://api.notion.com/v1/databases/' + activeIntegration.notionDatabaseId + '/query', {}, activeIntegration.notionRequestHeader)
          .then(notionDatabasePages => {
            activeIntegration.notionDatabasePageResults = notionDatabasePages.data.results
          })
        })
        .then(async () => {
          // For each Notion page, get the title property and put results in array with page ID
          activeIntegration.notionPages = []
          for ( let j = 0; j < activeIntegration.notionDatabasePageResults.length; j++ ) {
              await axios.get('https://api.notion.com/v1/pages/' + activeIntegration.notionDatabasePageResults[j].id + '/properties/title', activeIntegration.notionRequestHeader).then(notionPageProperties => {
              if (notionPageProperties.data.results[0]) {
                activeIntegration.notionPages.push({
                  title: notionPageProperties.data.results[0].title.plain_text,
                  id: activeIntegration.notionDatabasePageResults[j].id,
                  isCompleted: activeIntegration.notionDatabasePageResults[j].properties[''].checkbox
                })
              }
            })
          }
        })
        .then(async () => {
          // Get label_id for "notion" label in Todoist
          await todoist.getLabels().then(todoistLabels => {
            var notionLabelId
            for ( let k = 0; k < todoistLabels.data.length; k++ ) {
              if (todoistLabels.data[k].name == activeIntegration.source_query) {
                notionLabelId = todoistLabels.data[k].id
              }
            }
            activeIntegration.notionLabelId = notionLabelId
          })
        }).then(async () => {
          // Get tasks from Todoist with the "notion" label
          await todoist.getTasksByLabel(activeIntegration.notionLabelId).then(async todoistTasks => {
            activeIntegration.todoistTasks = todoistTasks
          })
        }).then(async () => {
          // For each task from Todoist, if it does not already exist as a page in Notion then add as page to Notion database
          for ( let j = 0; j < activeIntegration.todoistTasks.data.length; j++ ) {
            let isFound = false
            let isComplete = false
            if (activeIntegration.notionPages.length !== 0) {
              isFound = activeIntegration.notionPages.some(element => {
                if (element.title == activeIntegration.todoistTasks.data[j].content) {
                  return true;
                }
              });
              if (isFound) {
                isComplete = activeIntegration.notionPages.some(element => {
                  if ((element.title == activeIntegration.todoistTasks.data[j].content) && element.isCompleted) {
                    return true;
                  }
                })
              }
            }
            if (!isFound) {
              try {
                await axios.post('https://api.notion.com/v1/pages',
                {
                  "parent": { "database_id": activeIntegration.notionDatabaseId },
                  "properties": {
                    "Tasks": {
                      "title": [ { "text": { "content": activeIntegration.todoistTasks.data[j].content } } ]
                     }
                  }
                }, activeIntegration.notionRequestHeader)
              } catch (error) {
                console.log({'Error': error})
                return
              }
            }
            if (isComplete) {
              todoist.completeTask(activeIntegration.todoistTasks.data[j].id)
            }
          }
        }).then(async () => {
          // For each page in Notion, if task does not exist in Todoist, then remove page
          for (let k = 0; k < activeIntegration.notionPages.length; k++) {
            let isFound = false
            if (activeIntegration.todoistTasks.data.length !== 0) {
              isFound = activeIntegration.todoistTasks.data.some(element => {
                if (element.content == activeIntegration.notionPages[k].title) {
                  return true;
                }
              });
              if (activeIntegration.notionPages[k].isCompleted) {
                isFound = false
              }
              if (!isFound) {
                try {
                  await axios.patch('https://api.notion.com/v1/pages/' + activeIntegration.notionPages[k].id,
                  {
                    "archived": true
                  }, activeIntegration.notionRequestHeader);
                } catch (error) {
                  console.log({'Error': error.response.data.message})
                  return
                }
              }
            }
          }
        })
      }
    })
  });
}

exports.run = run;
