<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>ระบบการเข้างาน</h1>
      </div>
          <div class="nav-links">
            <router-link to="/" class="nav-link">แดชบอร์ด</router-link>
            <router-link to="/attendance" class="nav-link">เข้างาน</router-link>
            <router-link to="/leave" class="nav-link">ขอลา</router-link>
            <router-link to="/reports" class="nav-link">รายงาน</router-link>
          </div>
          <div class="nav-profile">
            <template v-if="auth.isAuthenticated">
              <div class="profile">
                <div class="avatar">{{ initials }}</div>
                <div class="meta">
                  <div class="name">{{ auth.user?.name || auth.user?.email }}</div>
                  <div class="email">{{ auth.user?.email }}</div>
                </div>
                <button class="logout" @click="logout">Logout</button>
              </div>
            </template>
            <template v-else>
              <router-link to="/login" class="nav-link">เข้าสู่ระบบ</router-link>
            </template>
          </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuth } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const auth = useAuth()

    function logout() {
      auth.clear()
      // redirect to login
      window.location.href = '/login'
    }

    const initials = computed(() => {
      const n = auth.user?.name || auth.user?.email || ''
      return n.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()
    })

    return { auth, logout, initials }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, var(--color-yellow) 0%, var(--color-yellow-100) 100%);
  color: var(--color-dark);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--color-dark);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(17,17,17,0.06);
}

.nav-link.router-link-active {
  background-color: rgba(17,17,17,0.08);
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>
