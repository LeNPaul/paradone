const Integration = require('../models/Integration');
const Setting = require('../models/Setting');
const Todoist = require('./todoist')
const Notion = require('./notion')
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
        let notion = new Notion()
        // Populate object with integration settings for active integration
        activeIntegration.userId = activeIntegrations[i].user_id
        activeIntegration.source = activeIntegrations[i].source
        activeIntegration.source_query = activeIntegrations[i].source_query
        activeIntegration.destination = activeIntegrations[i].destination
        activeIntegration.destination_modifier = activeIntegrations[i].destination_modifier
        // Populate object with user settings
        Setting.find({user_id: activeIntegration.userId})
        .then(userSettings => {
          todoist.initialize(userSettings[0].todoist_api_token)
          notion.initialize(userSettings[0].notion_api_token)
        })
        .then(async () => {
          return await notion.getPagesFromDatabaseByName(activeIntegration.destination_modifier).then(async notionPages => {
            // For each Notion page, get the title property and put results in array with page ID
            activeIntegration.notionPages = notionPages
          })
        })
        .then(async () => {
          // Get tasks with {{ source_query }} label in Todoist
          return await todoist.getTasksByLabelName(activeIntegration.source_query)
          .then(todoistTasks => {
            activeIntegration.todoistTasks = todoistTasks
          })
        })
        .then(async () => {
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
              notion.createPage(activeIntegration.notionDatabaseId, activeIntegration.todoistTasks.data[j].content)
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
                notion.markPageComplete(activeIntegration.notionPages[k].id)
              }
            }
          }
        })
      }
    })
  });
}

exports.run = run;
