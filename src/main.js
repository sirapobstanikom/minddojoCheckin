import { createApp } from 'vue'
import './assets/styles/variables.css'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Attendance from './views/Attendance.vue'
import LeaveRequest from './views/LeaveRequest.vue'
import Reports from './views/Reports.vue'
import Login from './views/login.vue'

const routes = [
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/attendance', component: Attendance, meta: { requiresAuth: true } },
  { path: '/leave', component: LeaveRequest, meta: { requiresAuth: true } },
  { path: '/reports', component: Reports, meta: { requiresAuth: true } },
  { path: '/login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global route guard: require token in localStorage for protected routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  if (to.meta && to.meta.requiresAuth && !token) {
    return next({ path: '/login' })
  }
  // prevent visiting login when already authenticated
  if (to.path === '/login' && token) {
    return next({ path: '/' })
  }
  return next()
})

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')
