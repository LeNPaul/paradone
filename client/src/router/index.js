import {createRouter, createWebHistory} from 'vue-router'
import store from '../store/index.js'
import Home from '../views/Home'
import Workspace from '../views/Workspace'
import WorkspaceParadigmEisenhower from '../views/WorkspaceParadigmEisenhower'
import WorkspaceParadigmKanban from '../views/WorkspaceParadigmKanban'
import WorkspaceParadigmPomodoro from '../views/WorkspaceParadigmPomodoro'
import Register from '../views/Register'
import Login from '../views/Login'
import ResetPassword from '../views/ResetPassword'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/app',
    name: 'Dashboard',
    component: Workspace,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/app/project/:project',
    name: 'Project',
    component: Workspace,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/app/label/:label',
    name: 'Label',
    component: Workspace,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/app/paradigm/kanban',
    name: 'Kanban',
    component: WorkspaceParadigmKanban,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/app/paradigm/eisenhower',
    name: 'Eisenhower',
    component: WorkspaceParadigmEisenhower,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/app/paradigm/pomodoro',
    name: 'Pomodoro',
    component: WorkspaceParadigmPomodoro,
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
    path: '/app/resetpassword',
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
