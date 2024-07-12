<template>
  <div class="popup-window" v-if="visible">
    <div class="popup-header">
      <button @click="close">Close</button>
      <button @click="toggleFullscreen">Fullscreen</button>
    </div>
    <iframe :src="url" frameborder="0"></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(true);
const url = ref('');

function close() {
  visible.value = false;
}

function toggleFullscreen() {
  const iframe = document.querySelector('iframe');
  if (!iframe) return console.error('No iframe found');
  if (iframe.requestFullscreen) {
    iframe.requestFullscreen();
  // } else if (iframe.mozRequestFullScreen) {
  //   iframe.mozRequestFullScreen();
  // } else if (iframe.webkitRequestFullscreen) {
  //   iframe.webkitRequestFullscreen();
  // } else if (iframe.msRequestFullscreen) {
  //   iframe.msRequestFullscreen();
  }
}
</script>

<style scoped>
.popup-window {
  position: fixed;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.popup-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f1f1f1;
  border-bottom: 1px solid #ccc;
}
iframe {
  width: 100%;
  height: calc(100% - 40px);
}
</style>
