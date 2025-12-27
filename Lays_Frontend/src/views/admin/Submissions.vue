<template>
  <div class="admin-submissions-page">
    <h3>Submissions</h3>
    <div v-if="loading" class="status">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="bags.length" class="submissions-list">
      <div v-for="b in bags" :key="b._id" class="submission-card">
        <div class="card-content">
          <strong>{{ b.name }}</strong> by {{ b.user?.firstName || 'unknown' }}
        </div>
        <button @click="remove(b._id)" class="remove-btn">Remove</button>
      </div>
    </div>
    <div v-else class="no-submissions">No submissions.</div>
  </div>
</template>

<script>
import api from '../../api';
export default {
  name: 'AdminSubmissions',
  data() { return { bags: [], loading: false, error: null }; },
  async created() { await this.load(); },
  methods: {
    async load() {
      this.loading = true; this.error = null;
      try { const res = await api.get('/bag'); this.bags = res.data; }
      catch (e) { this.error = 'Could not load submissions'; }
      this.loading = false;
    },
    async remove(id) {
      if (!confirm('Remove this submission?')) return;
      try { await api.delete(`/bag/${id}`); await this.load(); }
      catch (e) { alert('Could not remove submission'); }
    }
  }
}
</script>

<style scoped>
.admin-submissions-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 20px;
}

.admin-submissions-page h3 {
  color: #fbbf24;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
}

.status, .error, .no-submissions {
  text-align: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  margin: 20px 0;
}

.status {
  color: #e5e7eb;
}

.error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.no-submissions {
  color: #9ca3af;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.3s ease;
}

.submission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  border-color: rgba(251,191,36,0.2);
}

.card-content {
  flex: 1;
  color: #e5e7eb;
  font-size: 1rem;
}

.card-content strong {
  color: #fbbf24;
  font-weight: 600;
}

.remove-btn {
  background: linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(220,38,38,0.9) 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
}

.remove-btn:hover {
  background: linear-gradient(135deg, rgba(220,38,38,0.9) 0%, rgba(239,68,68,0.9) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239,68,68,0.4);
}

@media (max-width: 768px) {
  .admin-submissions-page {
    padding: 10px;
  }

  .submission-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .remove-btn {
    align-self: flex-end;
  }
}
</style>
