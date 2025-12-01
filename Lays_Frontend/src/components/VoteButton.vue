<template>
  <div>
    <button @click="vote" :disabled="voted">{{ voted ? 'Voted' : 'Vote' }}</button>
    <button v-if="voted" @click="remove">Remove Vote</button>
  </div>
</template>

<script>
import api from '../api';
export default {
  props: ['bagId'],
  data() { return { voted: false }; },
  async created() { await this.check(); },
  methods: {
    async check() {
      try {
        // naive check by fetching votes as admin is not possible; assume not voted
        // Better approach: backend could expose user votes; omitted for brevity
      } catch (err) { }
    },
    async vote() {
      try {
        await api.post(`/vote/${this.bagId}`);
        this.voted = true;
        this.$emit('voted');
      } catch (err) {
        alert(err.response?.data?.message || 'Could not vote');
      }
    },
    async remove() {
      try {
        await api.delete(`/vote/${this.bagId}`);
        this.voted = false;
        this.$emit('voted');
      } catch (err) {
        alert(err.response?.data?.message || 'Could not remove vote');
      }
    }
  }
}
</script>
