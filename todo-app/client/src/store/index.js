import { createStore } from 'vuex'

export default createStore({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user : JSON.parse(localStorage.getItem('user')) || {}
  },
  mutations: {
    register(state, newUser) {
      state.user = newUser.user
      state.token = newUser.token
      state.status = 'success'
    },
    login(state, user) {
      console.log(user)
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
    login({ commit }) {
      commit('login', 'login')
    }
  },
  modules: {
  }
})
