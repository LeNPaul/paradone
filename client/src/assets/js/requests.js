let fetchTask = async function(id) {
    const res = await fetch(`/api/tasks/${id}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token') || ''
      }
    })
    const data = await res.json()
    return data
  }

exports.fetchTask = fetchTask;