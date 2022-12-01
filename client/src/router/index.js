import {createRouter, createWebHistory} from 'vue-router'
import store from '../store/index.js'
import Workspace from '../views/Workspace'
import Register from '../views/Register'
import Login from '../views/Login'
import ResetPassword from '../views/ResetPassword'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Workspace,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/resetpassword',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next()
      return
    }
    next('/login')
  } else {
    next()
  }
})

export default router
