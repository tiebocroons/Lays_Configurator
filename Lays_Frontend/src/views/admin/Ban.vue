<template>
  <div>
    <h3>Ban Users</h3>
    
    <div class="search-section">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search by name or email..."
        @keyup.enter="search"
      />
      <button @click="search">Search</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>

    <div v-if="filteredUsers.length" class="users-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user._id" :class="{ banned: user.banned }">
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="{ 'banned-badge': user.banned, 'active-badge': !user.banned }">
                {{ user.banned ? 'Banned' : 'Active' }}
              </span>
            </td>
            <td>
              <button 
                v-if="!user.banned" 
                @click="banUser(user._id)"
                class="ban-btn"
              >
                Ban
              </button>
              <button 
                v-else 
                @click="unbanUser(user._id)"
                class="unban-btn"
              >
                Unban
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading && users.length === 0" class="no-users">
      No users found. Try searching.
    </div>
  </div>
</template>

<script>
import api from '../../api';

export default {
  name: 'AdminBan',
  data() {
    return {
      users: [],
      searchQuery: '',
      loading: false,
      error: null
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery.trim()) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    async search() {
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
    async banUser(userId) {
      if (!confirm('Ban this user?')) return;
      try {
        await api.post(`/user/${userId}/ban`);
        await this.search();
      } catch (e) {
        this.error = 'Could not ban user';
      }
    },
    async unbanUser(userId) {
      if (!confirm('Unban this user?')) return;
      try {
        await api.post(`/user/${userId}/unban`);
        await this.search();
      } catch (e) {
        this.error = 'Could not unban user';
      }
    }
  }
};
</script>

<style scoped>
.search-section {
  margin: 20px 0;
}

input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 14px;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #0056b3;
}

.ban-btn {
  background-color: #dc3545;
}

.ban-btn:hover {
  background-color: #c82333;
}

.unban-btn {
  background-color: #28a745;
}

.unban-btn:hover {
  background-color: #218838;
}

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
