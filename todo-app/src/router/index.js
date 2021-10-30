import {createRouter, createWebHistory} from 'vue-router'
import Dashboard from '../views/Dashboard'
import Project from '../views/Project'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/project/:project',
    name: 'Project',
    component: Project,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
