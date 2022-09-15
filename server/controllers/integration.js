const Integration = require('../models/Integration');
const Setting = require('../models/Setting');
const nodeCron = require("node-cron");
const axios = require('axios');

// TODO: create a class/object for user integration that is initialized based on what the integration is and with methods to get the required information and to work on the integration
let sync = function() {
  Integration.find({ is_active: true }).then(activeIntegrations => {
    // For each integration, find user settings using userID
    for (let i = 0 ; i < activeIntegrations.length ; i++) {
      Setting.find({user_id: activeIntegrations[i].user_id}).then(userSettings => {
        activeIntegrations[i].notion_api_token = userSettings[0].notion_api_token;
        activeIntegrations[i].todoist_api_token = userSettings[0].todoist_api_token;
        return activeIntegrations
      }).then(activeIntegrations =>{
        if(activeIntegrations[i].notion_api_token && activeIntegrations[i].todoist_api_token) {
          let todoistRequestHeader = {
            headers: {
              'Authorization': 'Bearer ' + activeIntegrations[i].todoist_api_token
            }
          }
          let notionRequestHeader = {
            headers: {
              'Authorization': 'Bearer ' + activeIntegrations[i].notion_api_token,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28'
            }
          }
          activeIntegrations[i].todoistRequestHeader = todoistRequestHeader
          activeIntegrations[i].notionRequestHeader = notionRequestHeader
          return activeIntegrations
        }
      }).then(activeIntegrations => {
        console.log(activeIntegrations)
      })
    }
  })
}

function run() {
  const job = nodeCron.schedule("0 * * * * *", function sync() {
    Integration.find({ is_active: true })
      .then(integrations => {
        // For each integration, find user settings using userID
        for (let i = 0 ; i < integrations.length ; i++) {
          let settings = Setting.find({user_id: integrations[i].user_id}).then(async settings => {
            if(settings[0].notion_api_token && settings[0].todoist_api_token) {
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
                notionDatabaseResults = await axios.post('https://api.notion.com/v1/search', { 'query': integrations[i].destination_modifier }, notionRequestHeader);
              } catch (error) {
                console.log({'Error': error.response.data.message})
                return
              }
              let notionDatabaseId
              if (notionDatabaseResults.data.results.length == 0) {
                console.log({'Error': 'Notion - Database with name ' + integrations[i].destination_modifier + ' not found.' })
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
                if (todoistLabels.data[k].name == integrations[0].source_query) {
                  notionLabelId = todoistLabels.data[k].id
                }
              }
              // Get tasks from Todoist with the "notion" label
              const todoistTasks = await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + notionLabelId, todoistRequestHeader);
              // For each task from Todoist, if it does not already exist as a page in Notion then add as page to Notion database
              for ( let j = 0; j < todoistTasks.data.length; j++ ) {
                let isFound = false
                let isComplete = false
                if (notionPages.length !== 0) {
                  isFound = notionPages.some(element => {
                    if (element.title == todoistTasks.data[j].content) {
                      return true;
                    }
                  });
                  if (isFound) {
                    isComplete = notionPages.some(element => {
                      if ((element.title == todoistTasks.data[j].content) && element.isCompleted) {
                        return true;
                      }
                    })
                  }
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
                    console.log({'Error': error})
                    return
                  }
                }
                if (isComplete) {
                  // Complete task in Todoist
                  try {
                    const todoistCompleteTaskRes = await axios.post('https://api.todoist.com/rest/v1/tasks/' + todoistTasks.data[j].id + '/close', {}, todoistRequestHeader);
                  } catch (error) {
                    console.log({'Error': error.response.statusText})
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
exports.sync = sync;
