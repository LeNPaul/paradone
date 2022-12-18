let header = {
  'Content-type': 'application/json',
  'x-auth-token': localStorage.getItem('token') || ''
}

let fetchTask = async function(id) {
  const res = await fetch(`/api/tasks/${id}`, {
    headers: header
  })
  return await res.json()
}

let fetchTasks = async function() {
  const res = await fetch('/api/tasks', {
    headers: header
  })
  return await res.json()
}

let createTask = async function(newTask) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: header,
    body: JSON.stringify(newTask),
  })
  return await res.json()
}

let updateTask = async function(id, updTask) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: header,
    body: JSON.stringify(updTask),
  })
  return await res.json()
}

exports.fetchTask = fetchTask;
exports.fetchTasks = fetchTasks;
exports.createTask = createTask;
exports.updateTask = updateTask;