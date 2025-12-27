<template>
  <div class="admin-page">
    <header class="page-head">
      <div>
        <p class="eyebrow">Administration</p>
        <h2>Admin Panel</h2>
        <p class="sub">Manage users, votes, submissions, and system settings.</p>
      </div>
    </header>

    <div class="admin-grid">
      <div class="admin-card">
        <div class="card-icon">📊</div>
        <h3>Votes</h3>
        <p>View and manage user votes on bags</p>
        <button @click="$router.push('/admin/votes')" class="admin-btn">See current votes</button>
      </div>

      <div class="admin-card">
        <div class="card-icon">🗂️</div>
        <h3>Submissions</h3>
        <p>Review and moderate bag submissions</p>
        <button @click="$router.push('/admin/submissions')" class="admin-btn">Remove submissions</button>
      </div>

      <div class="admin-card">
        <div class="card-icon">👥</div>
        <h3>Users</h3>
        <p>Manage user accounts and permissions</p>
        <button @click="$router.push('/admin/users')" class="admin-btn">See all users</button>
      </div>

      <div class="admin-card">
        <div class="card-icon">🚫</div>
        <h3>Moderation</h3>
        <p>Ban problematic users and content</p>
        <button @click="$router.push('/admin/ban')" class="admin-btn">Ban troll users</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Admin'
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 20px;
}

.page-head {
  text-align: center;
  margin-bottom: 40px;
}

.page-head .eyebrow {
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 8px 0;
}

.page-head h2 {
  margin: 0 0 12px 0;
  color: #fbbf24;
  font-size: 2.5rem;
  font-weight: 700;
}

.page-head .sub {
  margin: 0;
  color: #cbd5e1;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-card {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.3s ease;
  text-align: center;
}

.admin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 20px rgba(251,191,36,0.1);
  border-color: rgba(251,191,36,0.2);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.8;
}

.admin-card h3 {
  color: #fbbf24;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.admin-card p {
  color: #cbd5e1;
  margin: 0 0 24px 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.admin-btn {
  background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%);
  color: #0f172a;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(251,191,36,0.3);
  border: 1px solid rgba(251,191,36,0.5);
  width: 100%;
}

.admin-btn:hover {
  background: linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(251,191,36,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251,191,36,0.4);
}

@media (max-width: 768px) {
  .admin-page {
    padding: 15px;
  }

  .page-head h2 {
    font-size: 2rem;
  }

  .admin-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .admin-card {
    padding: 24px;
  }

  .card-icon {
    font-size: 2.5rem;
  }
}
</style>
