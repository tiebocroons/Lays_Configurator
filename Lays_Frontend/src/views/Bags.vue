<template>
  <div>
    <h2>Bags</h2>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul class="bag-list">
      <li v-for="bag in bags" :key="bag._id">
        <div class="bag-row">
          <div class="mini-preview" v-if="bag.modelUrl">
            <ConfiguratorThree :modelUrl="bag.modelUrl" />
          </div>
          <div class="bag-meta">
            <router-link :to="`/bags/${bag._id}`">{{ bag.name }}</router-link>
            <small>by {{ bag.user?.firstName || 'unknown' }}</small>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../api';
import { defineAsyncComponent } from 'vue';
const ConfiguratorThree = defineAsyncComponent(() => import('../components/ConfiguratorThree.vue'));
export default {
  components: { ConfiguratorThree },
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

<style scoped>
.bag-row { display: flex; align-items: center; gap: 12px; }
.mini-preview { width: 160px; height: 120px; border: 1px solid #ddd; overflow: hidden; }
.mini-preview > * { width: 100%; height: 100%; }
.bag-meta { display: flex; flex-direction: column; }
</style>
