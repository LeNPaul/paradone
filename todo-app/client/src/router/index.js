import {createRouter, createWebHistory} from 'vue-router'
import store from '../store/index.js'
import Main from '../views/Main'
import Project from '../views/Project'
import Eisenhower from '../views/Eisenhower'
import Kanban from '../views/Kanban'
import Pomodoro from '../views/Pomodoro'
import Register from '../views/Register'
import Login from '../views/Login'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
  },
  {
    path: '/project/:project',
    name: 'Project',
    component: Project,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/paradigm/eisenhower',
    name: 'Eisenhower',
    component: Eisenhower,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/paradigm/kanban',
    name: 'Kanban',
    component: Kanban,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/paradigm/pomodoro',
    name: 'Pomodoro',
    component: Pomodoro,
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
