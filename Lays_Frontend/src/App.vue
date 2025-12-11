<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/bags">Bags</router-link>
      <router-link to="/configurator-vue">Configurator</router-link>
      <div class="spacer"></div>
      <template v-if="!token">
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>
      <template v-else>
        <router-link v-if="isAdmin" to="/admin">Admin</router-link>
        <button @click="logout">Logout</button>
      </template>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    token() { return localStorage.getItem('token'); }
  },
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
