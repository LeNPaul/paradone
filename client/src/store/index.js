import { createStore } from 'vuex'

export default createStore({
  state: {
    token     : localStorage.getItem('token') || '',
    user      : localStorage.getItem('user') || '',
    expiresIn : localStorage.getItem('expiresIn') || 0,
    labels: [],
    projects: []
  },
  mutations: {
    auth_success(state, data){
      state.token     = data.token
      state.user      = data.user
      state.expiresIn = data.expiresIn
    },
    logout(state){
      state.token = ''
      state.user = ''
      state.expiresIn = 0
    },
    update_labels(state, data){
      state.labels = data
    },
    update_projects(state, data){
      state.projects = data
    }
  },
  actions: {
    async register({ commit }, newUser) {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
      const data = await res.json()
      if(res.status == 200) {
        const expiresIn = Date.now() + 2592000000
        data.expiresIn = expiresIn
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('expiresIn', expiresIn)
        commit('auth_success', data)
      } else {
        return data
      }
    },
    async login({ commit }, user) {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(user)
      })
      const data = await res.json()
      if(res.status == 200) {
        const expiresIn = Date.now() + 2592000000
        data.expiresIn = expiresIn
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('expiresIn', expiresIn)
        commit('auth_success', data)
      } else {
        return data
      }
    },
    async resetPassword({ commit }, user) {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(user)
      })
      const data = await res.json()
      if(res.status == 200) {
        const expiresIn = Date.now() + 2592000000
        data.expiresIn = expiresIn
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('expiresIn', expiresIn)
        commit('auth_success', data)
      } else {
        return data
      }
    },
    logout({ commit }) {
      commit('logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('expiresIn')
    },
    async fetchLabels({ commit }) {
      const res = await fetch('/api/labels', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      if(res.status == 200) {
        commit('update_labels', data)
      } else {
        return data
      }
    },
    async fetchProjects({ commit }) {
      const res = await fetch('/api/projects', {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      })
      const data = await res.json()
      if(res.status == 200) {
        commit('update_projects', data)
      } else {
        return data
      }
    }
  },
  getters: {
    isLoggedIn: state => !!state.token && state.expiresIn > Date.now()
  },
  modules: {
  }
})
