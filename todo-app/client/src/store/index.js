import { createStore } from 'vuex'

export default createStore({
  state: {
    token     : localStorage.getItem('token') || '',
    user      : localStorage.getItem('user') || '',
    expiresIn : localStorage.getItem('expiresIn') || 0,
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
      const expiresIn = Date.now() + 60000
      data.expiresIn = expiresIn
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('expiresIn', expiresIn)
      commit('auth_success', data)
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
      const expiresIn = Date.now() + 60000
      data.expiresIn = expiresIn
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('expiresIn', expiresIn)
      commit('auth_success', data)
    },
    logout({ commit }) {
      commit('logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('expiresIn')
    }
  },
  getters: {
    isLoggedIn: state => !!state.token && state.expiresIn > Date.now()
  },
  modules: {
  }
})
