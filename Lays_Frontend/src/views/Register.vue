<template>
  <div class="auth-page">
    <div class="auth-card">
      <header class="page-head">
        <p class="eyebrow">Account</p>
        <h2>Register</h2>
        <p class="sub">Create an account to submit and vote on bags.</p>
      </header>

      <form class="auth-form" @submit.prevent="submit">
        <div class="row">
          <input v-model="firstName" autocomplete="given-name" placeholder="First name" />
          <input v-model="lastName" autocomplete="family-name" placeholder="Last name" />
        </div>
        <input v-model="email" type="email" autocomplete="email" placeholder="Email" />
        <input v-model="password" type="password" autocomplete="new-password" placeholder="Password" />
        <button class="submit-btn" type="submit">Register</button>
      </form>

      <div v-if="error" class="error">{{ error }}</div>
    </div>
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

<style scoped>
.auth-page {
  display: grid;
  place-items: start center;
  padding: 18px 0;
  color: #e5e7eb;
}

.auth-card {
  width: min(580px, 100%);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.page-head {
  margin-bottom: 14px;
}

.page-head .eyebrow {
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.page-head h2 {
  margin: 6px 0 4px;
  color: #fbbf24;
}

.page-head .sub {
  margin: 0;
  color: #cbd5e1;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.auth-form input {
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background-color: rgba(30, 41, 59, 0.8);
  color: #e5e7eb;
  font-size: 0.95rem;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
}

.auth-form input:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
  background-color: rgba(30, 41, 59, 0.9);
}

.auth-form input::placeholder {
  color: #9ca3af;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%);
  color: #0f172a;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.98rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(251, 191, 36, 0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
}

.error {
  text-align: center;
  padding: 12px;
  border-radius: 10px;
  margin-top: 14px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

@media (max-width: 560px) {
  .row { grid-template-columns: 1fr; }
  .auth-card { padding: 18px; }
}
</style>
