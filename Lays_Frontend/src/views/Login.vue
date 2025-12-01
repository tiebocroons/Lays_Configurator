<template>
  <div class="auth">
    <h2>Login</h2>
    <form @submit.prevent="submit">
      <input v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import api from '../api';
export default {
  data() {
    return { email: '', password: '', error: null };
  },
  methods: {
    async submit() {
      this.error = null;
      try {
        const res = await api.post('/user/auth', { email: this.email, password: this.password });
        localStorage.setItem('token', res.data.token);
        window.location.href = '/';
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed';
      }
    }
  }
}
</script>
