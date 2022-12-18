let fetchTask = async function(id) {
  const res = await fetch(`/api/tasks/${id}`, {
    headers: {
      'x-auth-token': localStorage.getItem('token') || ''
    }
  })
  const data = await res.json()
  return data
}

let fetchTasks = async function() {
  const res = await fetch('/api/tasks', {
    headers: {
      'x-auth-token': localStorage.getItem('token') || ''
    }
  })
  const data = await res.json()
  return data
}

let createTask = async function(newTask) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'x-auth-token': localStorage.getItem('token') || ''
    },
    body: JSON.stringify(newTask),
  })
  const data = await res.json()
  return data
}

exports.fetchTask = fetchTask;
exports.fetchTasks = fetchTasks;
exports.createTask = createTask;