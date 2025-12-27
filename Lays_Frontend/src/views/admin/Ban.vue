<template>
  <div class="admin-ban-page">
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
.admin-ban-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 20px;
}

.admin-ban-page h3 {
  color: #fbbf24;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-section input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  background-color: rgba(30,41,59,0.8);
  color: #e5e7eb;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-section input:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.2);
  background-color: rgba(30,41,59,0.9);
}

.search-section input::placeholder {
  color: #9ca3af;
}

.search-section button {
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%);
  color: #0f172a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(251,191,36,0.3);
}

.search-section button:hover {
  background: linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(251,191,36,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251,191,36,0.4);
}

.loading, .error, .no-users {
  text-align: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  margin: 20px 0;
}

.loading {
  color: #e5e7eb;
}

.error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.no-users {
  color: #9ca3af;
}

.users-list table {
  width: 100%;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
}

thead {
  background: linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.1) 100%);
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

th {
  color: #fbbf24;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  color: #e5e7eb;
  font-size: 0.9rem;
}

tbody tr:hover {
  background: rgba(255,255,255,0.02);
  transition: background 0.2s ease;
}

tbody tr.banned {
  background: rgba(239, 68, 68, 0.1);
  opacity: 0.7;
}

tbody tr:last-child td {
  border-bottom: none;
}

.banned-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.active-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.ban-btn, .unban-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.ban-btn {
  background: linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(220,38,38,0.9) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239,68,68,0.3);
}

.ban-btn:hover {
  background: linear-gradient(135deg, rgba(220,38,38,0.9) 0%, rgba(239,68,68,0.9) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239,68,68,0.4);
}

.unban-btn {
  background: linear-gradient(135deg, rgba(34,197,94,0.9) 0%, rgba(22,163,74,0.9) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(34,197,94,0.3);
}

.unban-btn:hover {
  background: linear-gradient(135deg, rgba(22,163,74,0.9) 0%, rgba(34,197,94,0.9) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34,197,94,0.4);
}

@media (max-width: 768px) {
  .admin-ban-page {
    padding: 10px;
  }

  .search-section {
    flex-direction: column;
  }

  table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 12px 8px;
  }

  .ban-btn, .unban-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
</style>
