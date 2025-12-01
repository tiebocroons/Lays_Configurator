<template>
  <div>
    <h3>All Users</h3>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <table v-if="users.length">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Banned</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="u in users" :key="u._id">
          <td>{{ u.firstName }} {{ u.lastName }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.banned ? 'Yes' : 'No' }}</td>
          <td>
            <button v-if="!u.banned" @click="ban(u._id)">Ban</button>
            <button v-else @click="unban(u._id)">Unban</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>No users found.</div>
  </div>
</template>

<script>
import api from '../../api';
export default {
  name: 'AdminUsers',
  data() { return { users: [], loading: false, error: null }; },
  async created() { await this.load(); },
  methods: {
    async load() {
      this.loading = true; this.error = null;
      try { const res = await api.get('/user'); this.users = res.data; }
      catch (e) { this.error = 'Could not load users'; }
      this.loading = false;
    },
    async ban(id) {
      if (!confirm('Ban this user?')) return;
      try { await api.post(`/user/${id}/ban`); await this.load(); }
      catch (e) { alert('Could not ban user'); }
    },
    async unban(id) {
      if (!confirm('Unban this user?')) return;
      try { await api.post(`/user/${id}/unban`); await this.load(); }
      catch (e) { alert('Could not unban user'); }
    }
  }
}
</script>
