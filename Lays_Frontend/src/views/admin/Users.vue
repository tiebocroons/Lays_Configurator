<template>
  <div class="admin-users-page">
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
.admin-users-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 20px;
}

.admin-users-page h3 {
  color: #fbbf24;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
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

.admin-badge, .user-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.admin-badge {
  background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%);
  color: #0f172a;
}

.user-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
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
  .admin-users-page {
    padding: 10px;
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
