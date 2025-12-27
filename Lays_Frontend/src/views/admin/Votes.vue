<template>
  <div class="admin-votes-page">
    <header class="page-head">
      <div>
        <p class="eyebrow">Analytics</p>
        <h3>Vote Analytics</h3>
        <p class="sub">Visual insights into voting patterns and popular content.</p>
      </div>
    </header>

    <div v-if="loading" class="loading">Loading vote data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="votes.length" class="analytics-grid">
      <!-- Vote Statistics Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">{{ totalVotes }}</div>
          <div class="stat-label">Total Votes</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎨</div>
          <div class="stat-value">{{ uniqueBags }}</div>
          <div class="stat-label">Bags Voted On</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ uniqueUsers }}</div>
          <div class="stat-label">Active Voters</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-value">{{ avgVotesPerBag.toFixed(1) }}</div>
          <div class="stat-label">Avg Votes/Bag</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Top Row: Popular Bags and Active Voters -->
        <div class="charts-row">
          <!-- Top Bags Chart -->
          <div class="chart-card">
            <h4>Most Popular Bags</h4>
            <div class="bar-chart">
              <div
                v-for="bag in topBags.slice(0, 10)"
                :key="bag._id"
                class="bar-item"
              >
                <div class="bar-label">{{ bag.name || 'Unnamed' }}</div>
                <div class="bar-container">
                  <div
                    class="bar"
                    :style="{ width: `${(bag.votes / maxVotes) * 100}%` }"
                  ></div>
                  <div class="bar-value">{{ bag.votes }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Voters Chart -->
          <div class="chart-card">
            <h4>Most Active Voters</h4>
            <div class="bar-chart">
              <div
                v-for="user in topVoters.slice(0, 10)"
                :key="user._id"
                class="bar-item"
              >
                <div class="bar-label">{{ user.name || user.email }}</div>
                <div class="bar-container">
                  <div
                    class="bar"
                    :style="{ width: `${(user.votes / maxUserVotes) * 100}%` }"
                  ></div>
                  <div class="bar-value">{{ user.votes }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row: Timeline Chart (Full Width) -->
        <div class="timeline-row">
          <!-- Votes Over Time Chart -->
          <div class="chart-card timeline-card">
            <h4>Vote Activity Over Time</h4>
            <div class="timeline-chart">
              <div class="timeline-bars">
                <div
                  v-for="day in voteTimeline"
                  :key="day.date"
                  class="timeline-bar"
                  :style="{ height: `${(day.votes / maxDailyVotes) * 100}%` }"
                  :title="`${day.date}: ${day.votes} votes`"
                ></div>
              </div>
              <div class="timeline-labels">
                <div
                  v-for="day in voteTimeline"
                  :key="day.date"
                  class="timeline-label"
                >
                  {{ formatDateLabel(day.date) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Table -->
      <div class="table-card">
        <h4>Recent Votes</h4>
        <table>
          <thead>
            <tr><th>User</th><th>Bag</th><th>Created</th></tr>
          </thead>
          <tbody>
            <tr v-for="v in votes.slice(0, 50)" :key="v._id">
              <td>{{ v.user?.firstName }} {{ v.user?.lastName }} ({{ v.user?.email }})</td>
              <td>{{ v.bag?.name }}</td>
              <td>{{ new Date(v.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="votes.length > 50" class="table-note">
          Showing first 50 votes. Total: {{ votes.length }}
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <div class="no-data-icon">📊</div>
      <h4>No votes yet</h4>
      <p>Vote data will appear here once users start voting on bags.</p>
    </div>
  </div>
</template>

<script>
import api from '../../api';
export default {
  name: 'AdminVotes',
  data() { return { votes: [], loading: false, error: null }; },
  computed: {
    totalVotes() {
      return this.votes.length;
    },
    uniqueBags() {
      const bagIds = new Set(this.votes.map(v => v.bag?._id).filter(Boolean));
      return bagIds.size;
    },
    uniqueUsers() {
      const userIds = new Set(this.votes.map(v => v.user?._id).filter(Boolean));
      return userIds.size;
    },
    avgVotesPerBag() {
      return this.uniqueBags > 0 ? this.totalVotes / this.uniqueBags : 0;
    },
    topBags() {
      const bagVotes = {};
      this.votes.forEach(vote => {
        const bagId = vote.bag?._id;
        const bagName = vote.bag?.name || 'Unnamed';
        if (bagId) {
          if (!bagVotes[bagId]) {
            bagVotes[bagId] = { _id: bagId, name: bagName, votes: 0 };
          }
          bagVotes[bagId].votes++;
        }
      });
      return Object.values(bagVotes).sort((a, b) => b.votes - a.votes);
    },
    maxVotes() {
      return Math.max(...this.topBags.map(b => b.votes), 1);
    },
    topVoters() {
      const userVotes = {};
      this.votes.forEach(vote => {
        const userId = vote.user?._id;
        const userName = vote.user ? `${vote.user.firstName} ${vote.user.lastName}` : vote.user?.email || 'Unknown';
        if (userId) {
          if (!userVotes[userId]) {
            userVotes[userId] = { _id: userId, name: userName, votes: 0 };
          }
          userVotes[userId].votes++;
        }
      });
      return Object.values(userVotes).sort((a, b) => b.votes - a.votes);
    },
    maxUserVotes() {
      return Math.max(...this.topVoters.map(u => u.votes), 1);
    },
    voteTimeline() {
      const days = {};
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Initialize last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        days[dateStr] = { date: dateStr, votes: 0 };
      }

      // Count votes per day
      this.votes.forEach(vote => {
        const voteDate = new Date(vote.createdAt).toISOString().split('T')[0];
        if (days[voteDate]) {
          days[voteDate].votes++;
        }
      });

      return Object.values(days);
    },
    maxDailyVotes() {
      return Math.max(...this.voteTimeline.map(d => d.votes), 1);
    }
  },
  methods: {
    formatDateLabel(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  },
  async created() {
    this.loading = true;
    try {
      const res = await api.get('/vote');
      this.votes = res.data;
    } catch (e) {
      this.error = 'Could not load votes';
    }
    this.loading = false;
  }
}
</script>

<style scoped>
.admin-votes-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 20px;
}

.page-head {
  text-align: center;
  margin-bottom: 32px;
}

.page-head .eyebrow {
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 8px 0;
}

.page-head h3 {
  color: #fbbf24;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.page-head .sub {
  margin: 0;
  color: #cbd5e1;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.analytics-grid {
  display: grid;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 12px;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 4px;
}

.stat-label {
  color: #cbd5e1;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.timeline-row {
  width: 100%;
}

.chart-card {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
}

.chart-card h4 {
  color: #fbbf24;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  min-width: 120px;
  font-size: 0.85rem;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar {
  height: 24px;
  background: linear-gradient(90deg, rgba(251,191,36,0.8) 0%, rgba(245,158,11,0.8) 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.bar:hover {
  background: linear-gradient(90deg, rgba(251,191,36,1) 0%, rgba(245,158,11,1) 100%);
  box-shadow: 0 0 8px rgba(251,191,36,0.4);
}

.bar-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fbbf24;
  min-width: 20px;
  text-align: right;
}

.timeline-chart {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.timeline-bars {
  flex: 1;
  display: flex;
  align-items: end;
  gap: 2px;
  padding: 0 20px;
}

.timeline-bar {
  flex: 1;
  background: linear-gradient(180deg, rgba(251,191,36,0.8) 0%, rgba(245,158,11,0.8) 100%);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.timeline-bar:hover {
  background: linear-gradient(180deg, rgba(251,191,36,1) 0%, rgba(245,158,11,1) 100%);
  box-shadow: 0 0 8px rgba(251,191,36,0.4);
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  margin-top: 8px;
}

.timeline-label {
  font-size: 0.7rem;
  color: #9ca3af;
  text-align: center;
  transform: rotate(-45deg);
  transform-origin: center top;
  white-space: nowrap;
}

.table-card {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
}

.table-card h4 {
  color: #fbbf24;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 20px 0;
}

table {
  width: 100%;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
}

thead {
  background: linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.1) 100%);
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

th {
  color: #fbbf24;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  color: #e5e7eb;
  font-size: 0.85rem;
}

tbody tr:hover {
  background: rgba(255,255,255,0.02);
  transition: background 0.2s ease;
}

tbody tr:last-child td {
  border-bottom: none;
}

.table-note {
  text-align: center;
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 16px;
  padding: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 40px 20px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  margin: 20px 0;
}

.loading {
  color: #e5e7eb;
}

.error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.no-data {
  color: #9ca3af;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-data h4 {
  color: #fbbf24;
  margin: 0 0 8px 0;
}

@media (max-width: 768px) {
  .admin-votes-page {
    padding: 10px;
  }

  .page-head h3 {
    font-size: 2rem;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .bar-label {
    min-width: 80px;
    font-size: 0.75rem;
  }

  .timeline-chart {
    height: 150px;
  }

  .timeline-label {
    font-size: 0.6rem;
  }

  table {
    font-size: 0.8rem;
  }

  th, td {
    padding: 8px 12px;
  }
}
</style>
