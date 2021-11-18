import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/Home'
import Project from '../views/Project'
import Eisenhower from '../views/Eisenhower'
import Kanban from '../views/Kanban'
import Pomodoro from '../views/Pomodoro'
import Register from '../views/Register'
import Login from '../views/Login'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/project/:project',
    name: 'Project',
    component: Project,
  },
  {
    path: '/paradigm/eisenhower',
    name: 'Eisenhower',
    component: Eisenhower,
  },
  {
    path: '/paradigm/kanban',
    name: 'Kanban',
    component: Kanban,
  },
  {
    path: '/paradigm/pomodoro',
    name: 'Pomodoro',
    component: Pomodoro,
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

export default router
