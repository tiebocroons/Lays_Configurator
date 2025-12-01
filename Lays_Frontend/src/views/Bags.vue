<template>
  <div>
    <h2>Bags</h2>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul class="bag-list">
      <li v-for="bag in bags" :key="bag._id">
        <router-link :to="`/bags/${bag._id}`">{{ bag.name }}</router-link>
        <small>by {{ bag.user?.firstName || 'unknown' }}</small>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../api';
export default {
  data() { return { bags: [], loading: false, error: null }; },
  async created() {
    this.loading = true;
    try {
      const res = await api.get('/bag');
      this.bags = res.data;
    } catch (err) { this.error = 'Could not load bags'; }
    this.loading = false;
  }
}
</script>
