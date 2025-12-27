<template>
  <div>
    <div v-if="loading">Loading bag...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <ConfiguratorThree
      v-else
      :readOnly="!canEdit"
      :bagData="bag"
      :bagId="bag?._id"
      :modelUrl="bag?.modelUrl || undefined"
    />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfiguratorThree from '../components/ConfiguratorThree.vue';
import api from '../api';

export default {
  components: { ConfiguratorThree },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const bag = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const loadBag = async () => {
      const id = route.query.id;
      if (!id) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await api.get(`/bag/${id}`);
        bag.value = res.data;
      } catch (e) {
        error.value = 'Could not load bag';
        // If it fails, go back
        router.replace('/bags');
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadBag);

    return { bag, loading, error };
  }
}
</script>

<style scoped>
div { padding: 12px }
.error { color: #dc3545; padding: 8px; }

/* Upload button styling */
.upload-btn {
  display: inline-block;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}
.upload-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}
</style>
