<template>
  <div>
    <h3>All Users</h3>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="users.length" class="users-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id" :class="{ banned: u.banned }">
            <td>{{ u.firstName }} {{ u.lastName }}</td>
            <td>{{ u.email }}</td>
            <td>
              <span :class="{ 'admin-badge': u.role === 'admin', 'user-badge': u.role === 'user' }">
                {{ u.role }}
              </span>
            </td>
            <td>
              <span :class="{ 'banned-badge': u.banned, 'active-badge': !u.banned }">
                {{ u.banned ? 'Banned' : 'Active' }}
              </span>
            </td>
            <td>
              <button v-if="!u.banned" @click="ban(u._id)" class="ban-btn">
                Ban
              </button>
              <button v-else @click="unban(u._id)" class="unban-btn">
                Unban
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading" class="no-users">
      No users found.
    </div>
  </div>
</template>

<script>
import api from '../../api';

export default {
  name: 'AdminUsers',
  data() {
    return { users: [], loading: false, error: null };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/user');
        this.users = res.data;
      } catch (e) {
        this.error = 'Could not load users';
      }
      this.loading = false;
    },
    async ban(id) {
      if (!confirm('Ban this user?')) return;
      try {
        await api.post(`/user/${id}/ban`);
        await this.load();
      } catch (e) {
        this.error = 'Could not ban user';
      }
    },
    async unban(id) {
      if (!confirm('Unban this user?')) return;
      try {
        await api.post(`/user/${id}/unban`);
        await this.load();
      } catch (e) {
        this.error = 'Could not unban user';
      }
    }
  }
};
</script>

<style scoped>
.error {
  color: #dc3545;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  background-color: #f8d7da;
}

.loading {
  color: #666;
  padding: 10px;
  font-style: italic;
}

.users-list {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

thead {
  background-color: #f8f9fa;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  font-weight: 600;
  color: #333;
}

tr:hover {
  background-color: #f8f9fa;
}

tr.banned {
  opacity: 0.7;
  background-color: #fff5f5;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.ban-btn {
  background-color: #dc3545;
  color: white;
}

.ban-btn:hover {
  background-color: #c82333;
}

.unban-btn {
  background-color: #28a745;
  color: white;
}

.unban-btn:hover {
  background-color: #218838;
}

.admin-badge {
  background-color: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.user-badge {
  background-color: #6c757d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.banned-badge {
  background-color: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.active-badge {
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.no-users {
  color: #666;
  padding: 20px;
  text-align: center;
  font-style: italic;
}
</style>
