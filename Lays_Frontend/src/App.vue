<template>
  <div class="app">
    <nav class="nav">
      <div class="brand">Lays Configurator</div>
      <div class="links">
        <router-link to="/">Home</router-link>
        <router-link to="/bags">Bags</router-link>
        <router-link to="/configurator-vue">Configurator</router-link>
      </div>
      <div class="spacer"></div>
      <div class="auth">
        <template v-if="!token">
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </template>
        <template v-else>
          <router-link v-if="isAdmin" to="/admin">Admin</router-link>
          <button @click="logout">Logout</button>
        </template>
      </div>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() { return { currentUser: null }; },
  computed: {
    token() { return localStorage.getItem('token'); },
    isAdmin() { return this.currentUser?.role === 'admin'; }
  },
  async created() {
    if (this.token) {
      try {
        const res = await (await import('./api')).default.get('/user/me');
        this.currentUser = res.data;
      } catch (e) { console.warn('Could not fetch current user', e); }
    }
  },
  methods: {
    logout() { localStorage.removeItem('token'); window.location.href = '/'; }
  }
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: radial-gradient(circle at 20% 20%, rgba(255,215,0,0.12), transparent 35%),
              radial-gradient(circle at 80% 0%, rgba(255,105,180,0.12), transparent 35%),
              linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1224 100%);
  color: #e5e7eb;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 22px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 6px 30px rgba(0,0,0,0.25);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #fbbf24;
}

.links, .auth {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spacer { flex: 1; }

.nav a {
  color: #e5e7eb;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.nav a.router-link-active {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.nav a:hover { background: rgba(255,255,255,0.06); }

.nav button {
  border: none;
  background: #ef4444;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav button:hover { background: #dc2626; }

.main {
  flex: 1;
  padding: 18px;
}

@media (max-width: 768px) {
  .nav { flex-wrap: wrap; gap: 10px; }
  .links, .auth { width: 100%; }
  .spacer { display: none; }
}
</style>
