<template>
  <div class="admin-panel">
    <h2>Admin Panel</h2>
    <div class="tiles">
      <button @click="$router.push('/admin/votes')" class="tile">See current votes</button>
      <button @click="$router.push('/admin/submissions')" class="tile">Remove submissions</button>
      <button @click="$router.push('/admin/users')" class="tile">See all users</button>
      <button @click="$router.push('/admin/ban')" class="tile">Ban troll users</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Admin'
}
</script>

<style scoped>
.admin-panel { padding: 16px; }
.tiles { display: flex; gap: 16px; margin-top: 16px; }
.tile { background: #7ee787; border: none; padding: 24px 28px; box-shadow: 0 6px 8px rgba(0,0,0,0.12); cursor: pointer; font-size: 1rem; }
</style>
