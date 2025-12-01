<template>
  <div class="auth">
    <h2>Register</h2>
    <form @submit.prevent="submit">
      <input v-model="firstName" placeholder="First name" />
      <input v-model="lastName" placeholder="Last name" />
      <input v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import api from '../api';
export default {
  data() {
    return { firstName: '', lastName: '', email: '', password: '', error: null };
  },
  methods: {
    async submit() {
      this.error = null;
      try {
        const res = await api.post('/user', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        });
        // register returns token
        localStorage.setItem('token', res.data.token);
        window.location.href = '/';
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed';
      }
    }
  }
}
</script>
