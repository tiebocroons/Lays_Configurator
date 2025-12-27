<template>
  <div class="bag-showcase">
    <div v-if="loading">Loading bag...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="bag" class="showcase-container">
      <!-- ThreeJS Showcase Scene -->
      <div class="showcase-main">
        <div class="showcase-scene">
          <BagPreviewThree
            :bag="bag"
          />
        </div>
      </div>

      <!-- Bag Sidebar -->
      <aside class="bag-sidebar">
        <div class="bag-header">
          <h2>{{ bag.name }}</h2>
          <div class="author-info">
            <span>by {{ bag.user?.firstName || bag.user?.email || 'Unknown' }}</span>
          </div>
        </div>

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
import BagPreviewThree from '../components/BagPreviewThree.vue';

export default {
  name: 'BagShowcase',
  components: { VoteButton, BagPreviewThree },
  props: ['id'],
  data() {
    return {
      bag: null,
      loading: false,
      error: null,
      refreshTimer: null
    };
  },
  async created() {
    await this.load();
    this.startAutoRefresh();
  },
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = null;
      const id = this.$route.query.id;
      if (!id) {
        this.error = 'No bag ID provided';
        this.loading = false;
        return;
      }
      try {
        const res = await api.get(`/bag/${id}`);
        this.bag = res.data;
      } catch (err) {
        this.error = 'Could not load bag';
      }
      this.loading = false;
    },
    formatDate(value) {
      try {
        return new Date(value).toLocaleString();
      } catch (e) {
        return value;
      }
    },
    async refresh() {
      await this.load();
    },
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
    }
  }
};
</script>

<style scoped>
.bag-showcase {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
}

.showcase-container {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.showcase-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.showcase-scene {
  flex: 1;
  min-height: 70vh;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
}

.bag-sidebar {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bag-header {
  background: rgba(15, 23, 42, 0.8);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.06);
}

.bag-header h2 {
  margin: 0 0 8px 0;
  color: #fbbf24;
  font-size: 1.8rem;
  font-weight: 700;
}

.author-info {
  color: #9ca3af;
  font-size: 0.9rem;
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
  max-width: 280px;
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

.error {
  color: #ef4444;
  padding: 12px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 4px;
  margin: 20px;
  text-align: center;
}

@media (max-width: 1024px) {
  .showcase-container {
    flex-direction: column;
  }

  .bag-sidebar {
    width: 100%;
    order: -1; /* Show sidebar above the 3D scene on mobile */
  }

  .showcase-scene {
    min-height: 60vh;
  }
}
</style>