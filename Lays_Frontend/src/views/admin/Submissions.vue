<template>
  <div>
    <h3>Submissions</h3>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-if="bags.length">
      <li v-for="b in bags" :key="b._id">
        <strong>{{ b.name }}</strong> by {{ b.user?.firstName || 'unknown' }}
        <button @click="remove(b._id)">Remove</button>
      </li>
    </ul>
    <div v-else>No submissions.</div>
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
