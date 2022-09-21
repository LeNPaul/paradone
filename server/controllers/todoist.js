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
  async getTasksByLabelName(labelName) {
    try {
      return await axios.get('https://api.todoist.com/rest/v1/labels', this.todoistRequestHeader)
      .then(todoistLabels => {
        for ( let k = 0; k < todoistLabels.data.length; k++ ) {
          if (todoistLabels.data[k].name == labelName) {
            return todoistLabels.data[k].id
          }
        }
      })
      .then(async labelId => {
        return await axios.get('https://api.todoist.com/rest/v1/tasks?label_id=' + labelId, this.todoistRequestHeader)
      })
    } catch(error) {
      return {'Error': error.response.statusText}
    }
  }
}

module.exports = Todoist
