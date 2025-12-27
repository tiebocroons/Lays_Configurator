<template>
  <div>
    <div v-if="loading">Loading bag...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!canEdit && !bag" class="login-prompt">
      <h3>You need to be logged in to create a bag</h3>
      <p>Please <router-link to="/login">login</router-link> or <router-link to="/register">register</router-link> to create your own bag designs.</p>
    </div>
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
import { onMounted, ref, computed } from 'vue';
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
    const currentUser = ref(null);

    const loadCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await api.get('/user/me');
        currentUser.value = res.data;
      } catch (e) {
        console.warn('Could not load current user', e);
        // If token is invalid, clear it
        if (e.response?.status === 401) {
          localStorage.removeItem('token');
        }
      }
    };

    const canEdit = computed(() => {
      if (!currentUser.value) return false;
      if (!bag.value) return true; // Can create new bag if logged in
      return bag.value.user?._id === currentUser.value._id || currentUser.value.role === 'admin';
    });

    const loadBag = async () => {
      const id = route.query.id;
      if (!id) {
        await loadCurrentUser();
        return;
      }
      loading.value = true;
      error.value = null;
      try {
        const res = await api.get(`/bag/${id}`);
        bag.value = res.data;
        await loadCurrentUser();
      } catch (e) {
        error.value = 'Could not load bag';
        // If it fails, go back
        router.replace('/bags');
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadBag);

    return { bag, loading, error, canEdit };
  }
}
</script>

<style scoped>
div { padding: 12px }
.error { color: #dc3545; padding: 8px; }

.login-prompt {
  text-align: center;
  padding: 40px 20px;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  max-width: 500px;
  margin: 40px auto;
}

.login-prompt h3 {
  color: #fbbf24;
  margin-bottom: 16px;
  font-size: 1.5rem;
}

.login-prompt p {
  color: #e2e8f0;
  margin-bottom: 20px;
}

.login-prompt a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  margin: 0 8px;
}

.login-prompt a:hover {
  color: #60a5fa;
  text-decoration: underline;
}

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
