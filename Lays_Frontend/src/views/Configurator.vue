<template>
  <div>
    <h2>Configurator</h2>
    <p>If the configurator files have been copied to <code>/public/configurator</code>, the embedded app will appear below.</p>
    <div class="config-frame">
      <iframe ref="frame" src="/configurator/index.html" frameborder="0" class="config-iframe"></iframe>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'ConfiguratorView',
  setup() {
    const frame = ref(null);

    onMounted(() => {
      const iframe = frame.value;
      if (!iframe) return;
      iframe.addEventListener('load', () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          // remove common navbar selectors inside the iframe
          const selectors = ['.nav', 'nav', '.navbar', 'header'];
          selectors.forEach(sel => {
            const el = doc.querySelector(sel);
            if (el) el.remove();
          });
          // also inject a small style to ensure no layout shift
          const style = doc.createElement('style');
          style.innerHTML = 'body { margin: 0 !important; }';
          doc.head && doc.head.appendChild(style);
        } catch (err) {
          // likely cross-origin or not ready; ignore silently
        }
      });
    });

    return { frame };
  }
}
</script>

<style scoped>
.config-frame { margin-top: 16px }
.config-iframe { width: 100%; height: 80vh; border: none; }
</style>
