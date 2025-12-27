<template>
  <div class="bags-page">
    <header class="page-head">
      <div>
        <p class="eyebrow">Browse</p>
        <h2>Bags Carousel</h2>
        <p class="sub">Swipe or use arrows to explore community creations. Use spacebar to play/pause, or click indicators below.</p>
      </div>
      <div class="controls">
        <router-link to="/configurator-vue" class="create-bag-btn">
          <span class="plus-icon">+</span>
          Create Bag
        </router-link>
        <button @click="prev" class="nav-btn" :disabled="currentIndex === 0">‹</button>
        <button @click="toggleAuto" class="play-pause-btn">
          <span v-if="auto">⏸️</span>
          <span v-else>▶️</span>
        </button>
        <button @click="next" class="nav-btn" :disabled="currentIndex >= bags.length - cardsPerView">›</button>
      </div>
    </header>

    <div v-if="loading" class="status">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="bags.length" class="carousel" @mouseleave="handleMouseLeave">
      
      <div
        class="track"
        :style="{
          width: `${bags.length * (100 / cardsPerView)}%`,
          transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`
        }"
      >
        <div
          class="card"
          v-for="(bag, index) in bags"
          :key="bag._id"
          :style="{ width: `${100 / cardsPerView}%`, '--bag-color': bag.bagColor || bag.color || '#FF0000' }"
        >
          <div class="card-bg">
            <div class="particles" :style="{ backgroundImage: getParticleBackground(index, bag.bagColor || bag.color) }"></div>
            <div class="shimmer"></div>
          </div>
          <div class="card-inner" @click="$router.push(`/bags/${bag._id}`)" @mouseenter="handleMouseEnter">
            <div class="card-top">
              <BagPreviewThree
                :bag="bag"
              />
              <div class="badge" v-if="bag.chipsType">{{ bag.chipsType }}</div>
              <div class="card-overlay">
                <div class="overlay-content">
                  <span class="view-text">Click to view</span>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="card-header">
                <h3>{{ bag.name }}</h3>
                <div class="vote-count" v-if="bag.voteCount !== undefined">
                  <span class="vote-icon">👍</span>
                  {{ bag.voteCount }}
                </div>
              </div>
              <p class="by">by {{ bag.user?.firstName || 'unknown' }}</p>
              <div class="meta">
                <span v-if="bag.bagColor" class="chip">
                  <span class="swatch" :style="{ background: bag.bagColor }"></span> {{ bag.bagColor }}
                </span>
                <span v-if="bag.keyFlavours?.length" class="chip">{{ bag.keyFlavours.join(', ') }}</span>
              </div>
              <router-link class="cta" :to="`/bags/${bag._id}`" @click.stop>View bag</router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Carousel Indicators -->
      <div class="carousel-indicators" v-if="totalPages() > 1">
        <button 
          v-for="page in totalPages()" 
          :key="page"
          :class="{ active: page - 1 === currentIndex }"
          @click="goToPage(page - 1)"
          class="indicator"
        ></button>
      </div>
    </div>

    <div v-else class="status">No bags yet.</div>
  </div>
</template>

<script>
import api from '../api';
import BagPreviewThree from '../components/BagPreviewThree.vue';
export default {
  components: { BagPreviewThree },
  data() { return { bags: [], loading: false, error: null, currentIndex: 0, cardsPerView: 3, auto: null, patternColors: ['#FF0000', '#FF6B35', '#FF9500', '#FFD700', '#FFFF00', '#7FFF00', '#00FF00', '#00FF7F', '#00FFFF', '#007FFF', '#0000FF', '#4B0082', '#9400D3', '#FF1493', '#FF69B4', '#FFFFFF', '#C0C0C0', '#808080', '#404040', '#000000'] }; },
  async created() {
    this.loading = true;
    try {
      const res = await api.get('/bag');
      this.bags = res.data;
      // Load vote counts for each bag
      await this.loadVoteCounts();
    } catch (err) { this.error = 'Could not load bags'; }
    this.loading = false;
    this.updateCardsPerView();
    window.addEventListener('resize', this.updateCardsPerView);
    window.addEventListener('keydown', this.handleKeydown);
    this.startAuto();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateCardsPerView);
    window.removeEventListener('keydown', this.handleKeydown);
    this.stopAuto();
  },
  methods: {
    bagPreviewSvg(bag) {
      const color = encodeURIComponent(bag.bagColor || bag.color || '#fbbf24');
      const text = encodeURIComponent(bag.name ? bag.name.slice(0, 14) : 'Lays');
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 160'>
          <defs>
            <linearGradient id='g' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stop-color='${color}' stop-opacity='0.92'/>
              <stop offset='100%' stop-color='${color}' stop-opacity='0.78'/>
            </linearGradient>
          </defs>
          <rect x='18' y='12' width='84' height='136' rx='14' fill='url(#g)' stroke='rgba(0,0,0,0.2)' stroke-width='3'/>
          <rect x='24' y='24' width='72' height='32' rx='12' fill='rgba(255,255,255,0.82)'/>
          <text x='60' y='46' font-family='Arial, sans-serif' font-size='18' font-weight='700' text-anchor='middle' fill='rgba(0,0,0,0.75)'>${text}</text>
          <circle cx='60' cy='104' r='20' fill='rgba(255,255,255,0.18)' />
        </svg>`;
      return `data:image/svg+xml,${svg.replace(/\n/g, '').replace(/\s+/g, ' ')}`;
    },
    updateCardsPerView() {
      this.cardsPerView = window.innerWidth < 768 ? 1 : 3;
      // Clamp currentIndex to new max
      const maxIndex = Math.max(0, this.bags.length - this.cardsPerView);
      if (this.currentIndex > maxIndex) this.currentIndex = maxIndex;
    },
    next() {
      if (!this.bags.length) return;
      const maxIndex = Math.max(0, this.bags.length - this.cardsPerView);
      this.currentIndex = (this.currentIndex + 1) % (maxIndex + 1);
    },
    prev() {
      if (!this.bags.length) return;
      const maxIndex = Math.max(0, this.bags.length - this.cardsPerView);
      this.currentIndex = (this.currentIndex - 1 + (maxIndex + 1)) % (maxIndex + 1);
    },
    goToPage(page) {
      this.currentIndex = page;
    },
    toggleAuto() {
      if (this.auto) {
        this.stopAuto();
      } else {
        this.startAuto();
      }
    },
    handleMouseEnter() {
      this.stopAuto();
    },
    handleMouseLeave() {
      this.startAuto();
    },
    totalPages() {
      return Math.ceil(this.bags.length / this.cardsPerView);
    },
    startAuto() {
      this.stopAuto();
      this.auto = setInterval(this.next, 4500);
    },
    stopAuto() {
      if (this.auto) {
        clearInterval(this.auto);
        this.auto = null;
      }
    },
    async loadVoteCounts() {
      try {
        const votePromises = this.bags.map(bag => 
          api.get(`/vote/count/${bag._id}`).then(res => ({
            id: bag._id,
            count: res.data.count
          })).catch(() => ({
            id: bag._id,
            count: 0
          }))
        );
        const voteResults = await Promise.all(votePromises);
        voteResults.forEach(result => {
          const bag = this.bags.find(b => b._id === result.id);
          if (bag) {
            bag.voteCount = result.count;
          }
        });
      } catch (err) {
        console.warn('Could not load vote counts', err);
        // Set default vote count of 0 for all bags
        this.bags.forEach(bag => {
          bag.voteCount = 0;
        });
      }
    },
    getParticleBackground(index, bagColor) {
      const color = bagColor || '#FF0000';
      return `radial-gradient(circle at 20% 30%, ${color}26 3px, transparent 3px), radial-gradient(circle at 80% 20%, ${color}18 4px, transparent 4px), radial-gradient(circle at 40% 80%, ${color}10 5px, transparent 5px), radial-gradient(circle at 60% 60%, ${color}15 3px, transparent 3px), radial-gradient(circle at 90% 90%, ${color}08 4px, transparent 4px)`;
    }
  }
}
</script>

<style scoped>
.bags-page { color: #e5e7eb; }
.page-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.page-head .eyebrow { letter-spacing: 1px; text-transform: uppercase; font-size: 12px; color: #9ca3af; margin: 0; }
.page-head h2 { margin: 4px 0; color: #fbbf24; }
.page-head .sub { margin: 0; color: #cbd5e1; }
.controls { display: flex; gap: 8px; margin-left: auto; align-items: center; }
.create-bag-btn { display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%); color: #0f172a; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(251,191,36,0.3); border: 1px solid rgba(251,191,36,0.5); }
.create-bag-btn:hover { background: linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(251,191,36,0.9) 100%); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(251,191,36,0.4); }
.plus-icon { font-size: 18px; font-weight: bold; }
.controls button { border: none; background: rgba(251,191,36,0.1); color: #fbbf24; padding: 10px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 16px; border: 1px solid rgba(251,191,36,0.3); }
.controls button:hover:not(:disabled) { background: rgba(251,191,36,0.2); transform: translateY(-1px); }
.controls button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.nav-btn { font-size: 18px; font-weight: bold; }
.play-pause-btn { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
.play-pause-btn:hover { background: rgba(251,191,36,0.2); border-color: #fbbf24; }

.carousel { position: relative; overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%); box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1); backdrop-filter: blur(20px); transition: all 0.3s ease; }
.carousel:hover { box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(251,191,36,0.1), inset 0 1px 0 rgba(255,255,255,0.15); }

.track { display: flex; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; position: relative; z-index: 1; }

.card { padding: 16px; box-sizing: border-box; position: relative; z-index: 3; }

.card-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 2; opacity: 0.3; transition: opacity 0.3s ease; }
.card:hover .card-bg { opacity: 1; }

.card-bg .particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 100px 100px, 150px 150px, 80px 80px, 120px 120px, 200px 200px;
  animation: particles 25s linear infinite;
  pointer-events: none;
  opacity: 0.6;
}

.card-bg .shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(251,191,36,0.01) 50%, transparent 70%);
  background-size: 200% 200%;
  animation: shimmer 8s ease-in-out infinite;
  pointer-events: none;
  opacity: 0.4;
}

.card-top { height: 180px; position: relative; overflow: hidden; border-radius: 12px 12px 0 0; }
.card-top-img { width: 100%; height: 100%; background-size: cover; background-position: center; transition: transform 0.3s ease; }
.card-inner:hover .card-top-img { transform: scale(1.05); }
.card-top-fallback { width: 100%; height: 100%; }

.card-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(15,23,42,0.8) 100%); opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: center; justify-content: center; }
.card-inner:hover .card-overlay { opacity: 1; }
.overlay-content { text-align: center; color: #fbbf24; font-weight: 600; font-size: 14px; }

.badge { position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%); color: #0f172a; padding: 6px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize; font-weight: 600; box-shadow: 0 4px 12px rgba(251,191,36,0.3); }

.card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-header h3 { margin: 0; color: #e5e7eb; font-size: 18px; font-weight: 600; line-height: 1.3; flex: 1; }
.vote-count { display: flex; align-items: center; gap: 4px; color: #fbbf24; font-size: 14px; font-weight: 600; background: rgba(251,191,36,0.1); padding: 4px 8px; border-radius: 12px; border: 1px solid rgba(251,191,36,0.2); }
.vote-icon { font-size: 12px; }

.by { margin: 0; color: #9ca3af; font-size: 14px; }

.meta { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { background: linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.05) 100%); padding: 6px 10px; border-radius: 20px; font-size: 12px; color: #fbbf24; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(251,191,36,0.2); transition: all 0.2s ease; }
.chip:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
.swatch { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); }

.cta { margin-top: auto; color: #fbbf24; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 16px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 8px; text-align: center; transition: all 0.2s ease; }
.cta:hover { background: rgba(251,191,36,0.2); border-color: #fbbf24; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(251,191,36,0.2); }

.carousel-indicators { display: flex; justify-content: center; gap: 8px; padding: 20px; }
.indicator { width: 12px; height: 12px; border-radius: 50%; border: none; background: rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s ease; }
.indicator:hover { background: rgba(255,255,255,0.4); transform: scale(1.2); }
.indicator.active { background: #fbbf24; box-shadow: 0 0 12px rgba(251,191,36,0.5); }

.status, .error { padding: 12px; border-radius: 8px; }
.status { background: rgba(255,255,255,0.04); color: #e5e7eb; }
.error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fecaca; }

@media (max-width: 768px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 8px; }
  .controls { margin-left: 0; order: 2; }
  .card-top { height: 160px; }
  .card-header { flex-direction: column; gap: 6px; align-items: flex-start; }
  .vote-count { align-self: flex-end; }
  .carousel-indicators { padding: 16px; }
  .indicator { width: 10px; height: 10px; }
}

/* Enhanced card animations */
.card-inner { 
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); 
  border: 1px solid rgba(255,255,255,0.08); 
  border-radius: 16px; 
  overflow: hidden; 
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 2px var(--bag-color, rgba(255,255,255,0.1)); 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  position: relative; 
}
.card-inner:hover { 
  transform: translateY(-12px) scale(1.03); 
  box-shadow: 0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.1); 
  border-color: rgba(251,191,36,0.4); 
}

/* Floating animation for cards */
.card:nth-child(odd) { animation: float 6s ease-in-out infinite; }
.card:nth-child(even) { animation: float 6s ease-in-out infinite reverse; }

@keyframes particles {
  0% { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
  25% { background-position: 100% 100%, 50% 50%, 25% 75%, 75% 25%, 50% 50%; }
  50% { background-position: 50% 50%, 100% 100%, 50% 25%, 25% 75%, 75% 25%; }
  75% { background-position: 25% 75%, 75% 25%, 75% 50%, 50% 50%, 100% 100%; }
  100% { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
}
</style>
