const axios = require('axios');

class Notion {
  initialize(apiToken) {
    this.notionRequestHeader = {
      headers: {
        'Authorization': 'Bearer ' + apiToken,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    }
  }
  async getPagesFromDatabaseByName(databaseName) {
    return await axios.post('https://api.notion.com/v1/search', { 'query': databaseName }, this.notionRequestHeader)
    .then(databaseResults => {
      if (databaseResults.data.results.length == 0) {
        console.log({'Error': 'Notion - Database with name ' + databaseName + ' not found.' })
        return
      } else {
        return databaseResults.data.results[0].id
      }
    })
    .then(async databaseId => {
      return await axios.post('https://api.notion.com/v1/databases/' + databaseId + '/query', {}, this.notionRequestHeader)
      .then(notionDatabasePages => {
        return {databaseId:databaseId, databasePages:notionDatabasePages.data.results}
      })
    })
  }
  async getPageProperties(pageId) {
    try {
      return await axios.get('https://api.notion.com/v1/pages/' + pageId + '/properties/title', this.notionRequestHeader)
    } catch(error) {
      return {'Error': error.response.data.message}
    }
  }
  async createPage(databaseId, content) {
    try {
      await axios.post('https://api.notion.com/v1/pages',
      {
        "parent": { "database_id": databaseId },
        "properties": {
          "Tasks": {
            "title": [ { "text": { "content": content } } ]
           }
        }
      }, this.notionRequestHeader)
    } catch(error) {
      return {'Error': error.response.data.message}
    }
  }
  async markPageComplete(pageId) {
    try {
      await axios.patch('https://api.notion.com/v1/pages/' + pageId,
      {
        "archived": true
      }, this.notionRequestHeader);
    } catch(error) {
      return {'Error': error.response.data.message}
    }
  }
}

module.exports = Notion
