import { createStore } from 'vuex'

export default createStore({
  state: {
    token     : localStorage.getItem('token') || '',
    user      : localStorage.getItem('user') || '',
    expiresIn : localStorage.getItem('expiresIn') || 0,
  },
  mutations: {
    auth_success(state, data){
      state.token = data.token
      state.user = data.user
    },
    logout(state){
      state.token = ''
      state.user = {}
    },
  },
  actions: {
    async register({ commit }, newUser) {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || ''
        },
        body: JSON.stringify(newUser)
      })
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('expiresIn', Date.now() + 60000)
      commit('auth_success', data)
    },
    async login({ commit }, user) {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || ''
        },
        body: JSON.stringify(user)
      })
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('expiresIn', Date.now() + 60000)
      commit('auth_success', data)
    },
    logout({ commit }) {
      commit('logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  getters: {
    isLoggedIn: state => !!state.token && state.expiresIn > Date.now()
  },
  modules: {
  }
})
