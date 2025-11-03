<template>
  <div id="app">
    <nav class="navbar" v-if="!isLogin">
      <div class="nav-brand">
        <span class="logo-icon">🕒</span>
        <span class="org-title">ระบบการเข้างาน</span>
      </div>
      <button class="menu-toggle" v-if="isMobile" @click="mobileNav = !mobileNav" :aria-expanded="mobileNav.toString()" aria-label="Show menu">
        <span :class="['hamburger', mobileNav ? 'active' : '']"><span></span><span></span><span></span></span>
      </button>
      <div :class="['nav-links', isMobile ? 'mobile' : '', isMobile && mobileNav ? 'open' : '']">
        <router-link to="/" class="nav-link" active-class="active">แดชบอร์ด</router-link>
        <router-link to="/attendance" class="nav-link" active-class="active">เข้างาน</router-link>
        <router-link to="/leave" class="nav-link" active-class="active">ขอลา</router-link>
        <router-link to="/reports" class="nav-link" active-class="active">รายงาน</router-link>
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
          <router-link to="/login" class="login-btn nav-link">เข้าสู่ระบบ</router-link>
        </template>
      </div>
    </nav>
    <div v-if="isMobile && mobileNav" class="backdrop" @click="mobileNav = false"/>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const auth = useAuth()
    const route = useRoute()
    const mobileNav = ref(false)
    const isMobile = ref(window.innerWidth <= 800)
    onMounted(() => {
      window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth <= 800
        if (!isMobile.value) mobileNav.value = false
      })
    })

    function logout() {
      auth.clear()
      // redirect to login
      window.location.href = '/login'
    }

    const initials = computed(() => {
      const n = auth.user?.name || auth.user?.email || ''
      return n.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()
    })

    const isLogin = computed(() => route.path === '/login')

    return { auth, logout, initials, isLogin, mobileNav, isMobile }
  }
}
</script>

<style>
@import './assets/styles/variables.css';

.navbar {
  background: var(--color-dark);
  color: var(--color-yellow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 2rem;
  box-shadow: var(--shadow-md);
  min-height: 64px;
  position: sticky;
  top: 0;
  z-index: 12;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.logo-icon {
  font-size: 2rem;
  color: var(--color-yellow);
  background: var(--color-dark);
  border-radius: 50%;
}
.org-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--color-yellow);
  letter-spacing: 1px;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  outline: none;
  margin-left: 1.2rem;
  cursor: pointer;
  z-index: 20;
}
.hamburger {
  display: block;
  width: 28px; height: 22px;
  position: relative;
}
.hamburger span {
  display: block;
  position: absolute;
  height: 4px; width: 100%;
  background: var(--color-yellow);
  border-radius: 2px;
  opacity: 1; left: 0;
  transition: all 0.28s cubic-bezier(.77,0,.175,1);
}
.hamburger span:nth-child(1) { top: 0; }
.hamburger span:nth-child(2) { top: 9px; }
.hamburger span:nth-child(3) { top: 18px; }
.hamburger.active span:nth-child(1) { transform: rotate(45deg); top: 9px; }
.hamburger.active span:nth-child(2) { opacity: 0; }
.hamburger.active span:nth-child(3) { transform: rotate(-45deg); top: 9px; }

.nav-links {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.nav-links.mobile {
  display: none;
  position: absolute;
  top: 64px;
  left: 0; right: 0;
  background: var(--color-dark);
  flex-direction: column;
  gap: 0.7rem;
  padding: 1.4rem 2rem 1.7rem 2rem;
  z-index: 15;
  min-width: 200px;
  animation: navdrawer-in 0.22s;
  box-shadow: 0 10px 40px rgba(0,0,0,.18);
}
.nav-links.mobile.open {
  display: flex;
}
@keyframes navdrawer-in {
  0% { transform: translateY(-25px); opacity: 0; }
  100% { transform: none; opacity: 1; }
}

.nav-link {
  color: var(--color-yellow);
  text-decoration: none;
  padding: 0.6rem 1.5rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 1rem;
  background: transparent;
  transition: background .2s, color .2s;
  display: inline-block;
  border: 1.5px solid transparent;
}
.nav-link:hover,
.nav-link.active,
.router-link-active {
  background: var(--color-yellow);
  color: var(--color-dark) !important;
  border-color: var(--color-yellow);
}
.login-btn {
  border: 1.5px solid var(--color-yellow);
  background: transparent !important;
  color: var(--color-yellow) !important;
  margin-left: 1rem;
  min-width: 120px;
  text-align: center;
}
.nav-profile {
  margin-left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.avatar {
  background: var(--color-yellow);
  color: var(--color-dark);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.3rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.10);
}
.meta {
  text-align: left;
}
.meta .name {
  font-size: 0.97rem;
  color: var(--color-yellow);
  font-weight: 600;
}
.meta .email {
  font-size: 0.81rem;
  color: var(--muted);
  font-weight: 400;
}
.logout {
  border: none;
  outline: none;
  background: var(--color-yellow);
  color: var(--color-dark);
  font-weight: 700;
  padding: 0.59rem 1.2rem;
  border-radius: 999px;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: filter .15s;
  box-shadow: var(--shadow-sm);
}
.logout:hover {
  filter: brightness(1.01) contrast(1.8);
  background: #ffe677;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.backdrop {
  background: rgba(0,0,0,0.4);
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  z-index: 6;
}

@media (max-width: 995px) {
  .main-content { padding: 1rem; }
  .org-title { font-size: 1.1rem; }
  .navbar { padding: 0.7rem 1rem; }
}
@media (max-width: 800px) {
  .navbar {
    flex-wrap: wrap;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.4rem 0.2rem;
  }
  .nav-profile { margin-left: 1.1rem; }
  .menu-toggle { display: block; margin-left: auto; }
  .nav-links { display: none; }
  .nav-links.mobile.open { display: flex; }
  .main-content { padding: 0.11rem; }
  .avatar { width: 35px; height: 35px; font-size: 1.08rem; }
}
@media (max-width: 600px) {
  .navbar { flex-direction: column; align-items: stretch; gap: 0.5rem 0; }
  .nav-profile { margin-left: 0.3rem; }
  .nav-links.mobile { width: 100vw; left: 0; right: 0; }
  .nav-link { width: 100%; text-align: left; }
  .main-content { padding: 0.2rem; }
  .profile { gap: 0.5rem; }
}
</style>
