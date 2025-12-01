<template>
  <div>
    <h3>Current Votes</h3>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <table v-if="votes.length">
      <thead>
        <tr><th>User</th><th>Bag</th><th>Created</th></tr>
      </thead>
      <tbody>
        <tr v-for="v in votes" :key="v._id">
          <td>{{ v.user?.firstName }} {{ v.user?.lastName }} ({{ v.user?.email }})</td>
          <td>{{ v.bag?.name }}</td>
          <td>{{ new Date(v.createdAt).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else>No votes yet.</div>
  </div>
</template>

<script>
import api from '../../api';
export default {
  name: 'AdminVotes',
  data() { return { votes: [], loading: false, error: null }; },
  async created() {
    this.loading = true;
    try {
      const res = await api.get('/vote');
      this.votes = res.data;
    } catch (e) { this.error = 'Could not load votes'; }
    this.loading = false;
  }
}
</script>
