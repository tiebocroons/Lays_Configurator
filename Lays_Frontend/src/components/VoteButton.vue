<template>
  <div class="vote-container">
    <div class="vote-count" v-if="voteCount !== null">
      <span class="vote-icon">👍</span>
      {{ voteCount }} {{ voteCount === 1 ? 'vote' : 'votes' }}
    </div>
    <div class="vote-buttons">
      <button v-if="!isLoggedIn" class="login-btn" @click="goToLogin">Login to Vote</button>
      <button v-else @click="vote" :disabled="voted" class="vote-btn" :class="{ voted: voted }">
        {{ voted ? 'Voted' : 'Vote' }}
      </button>
      <button v-if="voted" @click="remove" class="remove-btn">Remove Vote</button>
    </div>
  </div>
</template>

<script>
import api from '../api';
export default {
  props: ['bagId'],
  data() { return { voted: false, voteCount: null }; },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  },
  async created() { 
    const token = localStorage.getItem('token');
    if (token) {
      await this.checkVoteStatus();
    }
    await this.loadVoteCount();
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
    async checkVoteStatus() {
      try {
        // Check if user has voted for this bag
        const res = await api.get(`/vote/check/${this.bagId}`);
        this.voted = res.data.voted;
      } catch (err) {
        console.warn('Could not check vote status', err);
        this.voted = false; // Assume not voted if we can't check
      }
    },
    async loadVoteCount() {
      try {
        const res = await api.get(`/vote/count/${this.bagId}`);
        this.voteCount = res.data.count;
      } catch (err) {
        console.warn('Could not load vote count', err);
        this.voteCount = 0;
      }
    },
    async vote() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to vote');
        return;
      }
      try {
        await api.post(`/vote/${this.bagId}`);
        this.voted = true;
        await this.loadVoteCount();
        this.$emit('voted');
      } catch (err) {
        alert(err.response?.data?.message || 'Could not vote');
      }
    },
    async remove() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to remove vote');
        return;
      }
      try {
        await api.delete(`/vote/${this.bagId}`);
        this.voted = false;
        await this.loadVoteCount();
        this.$emit('voted');
      } catch (err) {
        alert(err.response?.data?.message || 'Could not remove vote');
      }
    }
  }
}
</script>

<style scoped>
.vote-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.vote-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e5e7eb;
  font-size: 1.1rem;
  font-weight: 600;
}

.vote-icon {
  font-size: 1.2rem;
}

.vote-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.vote-btn, .remove-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.vote-btn {
  background: #fbbf24;
  color: #0f172a;
}

.vote-btn:hover:not(:disabled) {
  background: #f59e0b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.vote-btn:disabled {
  background: rgba(251, 191, 36, 0.6);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.vote-btn.voted {
  background: rgba(251, 191, 36, 0.8);
}

.remove-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.login-btn {
  padding: 10px 16px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.login-btn:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}
</style>
