const axios = require('axios');

class Todoist {
  initialize(apiToken) {
    this.todoistRequestHeader = {
      headers: {
        'Authorization': 'Bearer ' + apiToken
      }
    }
  }
  async completeTask(taskId) {
    try {
      return await axios.post('https://api.todoist.com/rest/v1/tasks/' + taskId + '/close', {}, this.todoistRequestHeader);
    } catch(error) {
      return {'Error': error.response.statusText}
    }
  }
  async getLabels() {
    try {
      return await axios.get('https://api.todoist.com/rest/v1/labels', this.todoistRequestHeader)
    } catch(error) {
      return {'Error': error.response.statusText}
    }
  }
  async getTasksByLabel(labelId) {
    try {
      return await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + labelId, this.todoistRequestHeader)
    } catch(error) {
      return {'Error': error.response.statusText}
    }
  }
}

module.exports = Todoist
