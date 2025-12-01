<template>
  <div>
    <h2>Create Bag</h2>
    <form @submit.prevent="submit">
      <input v-model="name" placeholder="Name" />
      <input v-model="image" placeholder="Image URL" />
      <input v-model="bagColor" placeholder="Color" />
      <input v-model="font" placeholder="Font" />
      <input v-model="pattern" placeholder="Pattern" />
      <input v-model="packaging" placeholder="Packaging" />
      <input v-model="inspiration" placeholder="Inspiration" />
      <input v-model="keyFlavours" placeholder="Key flavours (comma separated)" />
      <button type="submit">Create</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import api from '../api';
export default {
  data() {
    return {
      name: '',
      image: '',
      bagColor: '',
      font: '',
      pattern: '',
      packaging: '',
      inspiration: '',
      keyFlavours: '',
      modelUrl: '/configurator/models/chips_bag.glb',
      error: null
    };
  },
  methods: {
    async submit() {
      this.error = null;
      try {
        const body = {
          name: this.name,
          image: this.image,
          bagColor: this.bagColor,
          font: this.font,
          pattern: this.pattern,
          packaging: this.packaging,
          inspiration: this.inspiration,
          keyFlavours: this.keyFlavours.split(',').map(s => s.trim()).filter(Boolean),
          modelUrl: this.modelUrl
        };
        await api.post('/bag', body);
        window.location.href = '/bags';
      } catch (err) {
        this.error = err.response?.data?.message || 'Could not create bag';
      }
    }
  }
}
</script>
