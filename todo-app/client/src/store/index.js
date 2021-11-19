import { createStore } from 'vuex'

export default createStore({
  state: {
    user: {}
  },
  mutations: {
    register(state, user) {
      console.log(user)
    },
    login(state, user) {
      console.log(user)
    }
  },
  actions: {
    register({ commit }) {
      commit('register', 'register')
    },
    login({ commit }) {
      commit('login', 'login')
    }
  },
  modules: {
  }
})
