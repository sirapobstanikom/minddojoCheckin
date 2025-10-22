import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuth = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const token = ref(localStorage.getItem('auth_token'))

  const isAuthenticated = computed(() => !!token.value)

  function setUser(u, t) {
    user.value = u
    token.value = t
    localStorage.setItem('auth_user', JSON.stringify(u))
    localStorage.setItem('auth_token', t)
  }

  function clear() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  return { user, token, isAuthenticated, setUser, clear }
})
