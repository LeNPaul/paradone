import { createStore } from 'vuex'

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    user : JSON.parse(localStorage.getItem('user')) || {}
  },
  mutations: {
    register(state, newUser) {
      state.user = newUser.user
      state.token = newUser.token
    },
    login(state, user) {
      state.user = user.user
      state.token = user.token
    }
  },
  actions: {
    async register({ commit }, newUser) {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(newUser)
      })
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      commit('register', data)
    },
    async login({ commit }, user) {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(user)
      })
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      commit('login', data)
    }
  },
  modules: {
  }
})
