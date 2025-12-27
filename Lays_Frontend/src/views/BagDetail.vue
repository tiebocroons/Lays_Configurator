<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="bag" class="bag-container">
      <div class="bag-main">
        <h2>{{ bag.name }}</h2>
        <div v-if="bag.modelUrl" class="bag-model">
          <ConfiguratorThree
            :readOnly="!canEdit()"
            :modelUrl="bag.modelUrl"
            :bagData="bag"
            :bagId="bag._id"
          />
        </div>
      </div>

      <aside class="bag-sidebar">
        <button @click="$router.back()" class="back-button">Back</button>
        
        <div class="vote-section">
          <vote-button :bag-id="bag._id" @voted="refresh" />
        </div>

        <div class="bag-details">
          <img v-if="bag.image" :src="bag.image" alt="bag image" class="bag-image" />

          <div v-if="bag.bagColor" class="detail-item">
            <strong>Color:</strong>
            <span class="color-swatch" :style="{ backgroundColor: bag.bagColor }"></span>
            {{ bag.bagColor }}
          </div>

          <div v-if="bag.color && bag.color !== bag.bagColor" class="detail-item">
            <strong>Alt Color (legacy):</strong> {{ bag.color }}
          </div>

          <div v-if="bag.font" class="detail-item">
            <strong>Font:</strong> {{ bag.font }}
          </div>

          <div v-if="bag.pattern" class="detail-item">
            <strong>Pattern:</strong> {{ bag.pattern }}
          </div>

          <div v-if="bag.packaging" class="detail-item">
            <strong>Packaging:</strong> {{ bag.packaging }}
          </div>

          <div v-if="bag.chipsType" class="detail-item">
            <strong>Chips Type:</strong> {{ bag.chipsType }}
          </div>

          <div v-if="bag.inspiration" class="detail-item">
            <strong>Inspiration:</strong> {{ bag.inspiration }}
          </div>

          <div v-if="bag.keyFlavours?.length" class="detail-item">
            <strong>Key Flavours:</strong> {{ bag.keyFlavours.join(', ') }}
          </div>

          <div v-if="bag.user" class="detail-item">
            <strong>Author:</strong> {{ bag.user.email || bag.user.firstName || bag.user.lastName || 'Unknown' }}
          </div>

          <div v-if="bag.createdAt" class="detail-item">
            <strong>Created:</strong> {{ formatDate(bag.createdAt) }}
          </div>
        </div>
      </aside>
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
  data() { return { bag: null, loading: false, error: null, currentUser: null, refreshTimer: null }; },
  async created() {
    await this.load();
    await this.loadMe();
    this.redirectIfNotOwner();
    this.startAutoRefresh();
  },
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  methods: {
    canEdit() {
      if (!this.bag || !this.currentUser) return false;
      const isOwner = this.bag.user && (this.bag.user._id === this.currentUser.id || this.bag.user._id === this.currentUser._id);
      return isOwner;
    },
    formatDate(value) {
      try {
        return new Date(value).toLocaleString();
      } catch (e) {
        return value;
      }
    },
    async load() {
      this.loading = true; this.error = null;
      const id = this.$route.params.id;
      try {
        const res = await api.get(`/bag/${id}`);
        this.bag = res.data;
      } catch (err) { this.error = 'Could not load bag'; }
      this.loading = false;
    },
    async loadMe() {
      try {
        const res = await api.get('/user/me');
        this.currentUser = res.data;
      } catch (e) {
        this.currentUser = null;
      }
    },
    async refresh() { await this.load(); }
    ,
    startAutoRefresh() {
      this.stopAutoRefresh();
      this.refreshTimer = setInterval(() => {
        this.load();
      }, 5000);
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    redirectIfNotOwner() {
      if (this.bag && this.currentUser && !this.canEdit()) {
        this.$router.replace({ path: '/bag-showcase', query: { id: this.bag._id } });
      }
    }
  }
}
</script>

<style scoped>
button {
  padding: 8px 16px;
  margin-bottom: 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background-color: #5a6268;
}

.error {
  color: #ef4444;
  padding: 12px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 4px;
  margin-bottom: 16px;
}

.bag-container {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.bag-main {
  flex: 1;
  min-width: 0;
}

.bag-main h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #e5e7eb;
}

.bag-model {
  width: 100%;
  height: 70vh;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.edit-locked {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px dashed rgba(255,255,255,0.2);
  border-radius: 8px;
  color: #e5e7eb;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.bag-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-button {
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%);
  color: #0f172a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(251,191,36,0.3);
  align-self: flex-start;
}

.back-button:hover {
  background: linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(251,191,36,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251,191,36,0.4);
}

.vote-section {
  background: rgba(15, 23, 42, 0.8);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  justify-content: center;
  align-items: center;
}

.bag-details {
  background: rgba(15, 23, 42, 0.8);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.06);
}

.bag-image {
  width: 100%;
  height: auto;
  max-width: 250px;
  display: block;
  margin-bottom: 16px;
  border-radius: 4px;
}

.detail-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.95rem;
  color: #e5e7eb;
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-item strong {
  display: block;
  color: #fbbf24;
  margin-bottom: 4px;
  font-weight: 600;
}

.detail-item span {
  color: #e5e7eb;
}

.color-swatch {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid rgba(255,255,255,0.2);
  margin-right: 8px;
  vertical-align: middle;
}

@media (max-width: 1024px) {
  .bag-container {
    flex-direction: column;
  }

  .bag-sidebar {
    width: 100%;
    flex-direction: row;
    gap: 16px;
  }

  .vote-section {
    flex: 1;
  }

  .bag-details {
    flex: 1;
  }

  .bag-model {
    height: 50vh;
  }
}
</style>
