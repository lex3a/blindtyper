<script setup lang="ts">
import ref from 'vue'
</script>

<template></template>


<style scoped>
.infoHeader {
  border: 2px solid rgb(41, 41, 41);
  border-radius: 10px;
  padding: 3rem;
  margin: auto 0;
  margin-bottom: 2rem;
}

.infoHeader p {
  margin: 10px;
}

@media (max-width: 768px) {
  .infoHeader {
    order: 1;
    display: flex;
    justify-content: space-around;
    align-items: start;
  }
}
</style>