<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/bags">Bags</router-link>
      <router-link to="/create">Create</router-link>
      <router-link to="/configurator">Configurator</router-link>
      <router-link to="/configurator-vue">Configurator (Vue)</router-link>
      <div class="spacer"></div>
      <template v-if="!token">
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>
      <template v-else>
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
  methods: {
    logout() { localStorage.removeItem('token'); window.location.href = '/'; }
  }
}
</script>
