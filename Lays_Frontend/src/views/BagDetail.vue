<template>
  <div>
    <button @click="$router.back()">Back</button>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="bag">
      <h2>{{ bag.name }}</h2>
      <div v-if="bag.modelUrl" class="bag-model">
        <ConfiguratorThree :modelUrl="bag.modelUrl" />
      </div>
      <img v-if="bag.image" :src="bag.image" alt="bag image" class="bag-image" />
      <p><strong>Color:</strong> {{ bag.bagColor }}</p>
      <p><strong>Font:</strong> {{ bag.font }}</p>
      <p><strong>Pattern:</strong> {{ bag.pattern }}</p>
      <p><strong>Packaging:</strong> {{ bag.packaging }}</p>
      <p><strong>Inspiration:</strong> {{ bag.inspiration }}</p>
      <p><strong>Key Flavours:</strong> {{ bag.keyFlavours?.join(', ') }}</p>
      <vote-button :bag-id="bag._id" @voted="refresh" />
    </div>
  </div>
</template>

<script>
import api from '../api';
import VoteButton from '../components/VoteButton.vue';
import { defineAsyncComponent } from 'vue';
const ConfiguratorThree = defineAsyncComponent(() => import('../components/ConfiguratorThree.vue'));
export default {
  components: { VoteButton, ConfiguratorThree },
  props: ['id'],
  data() { return { bag: null, loading: false, error: null }; },
  async created() { await this.load(); },
  methods: {
    async load() {
      this.loading = true; this.error = null;
      const id = this.$route.params.id;
      try {
        const res = await api.get(`/bag/${id}`);
        this.bag = res.data;
      } catch (err) { this.error = 'Could not load bag'; }
      this.loading = false;
    },
    async refresh() { await this.load(); }
  }
}
</script>
<style scoped>
.bag-model { width: 100%; height: 60vh; margin-bottom: 12px; }
.bag-image { max-width: 400px; display: block; margin-bottom: 12px; }
</style>
