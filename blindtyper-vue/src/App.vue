<script setup lang="ts">
import InfoHeader from './components/InfoHeader.vue'
import Quote from './components/Quote.vue'
</script>

<template>
  <div>

  </div>
</template>

<style scoped>
#hiddenType {
  color: transparent;
  background-color: transparent;
  overflow: hidden;
  border: none;
  caret-color: transparent;
  outline: 0;
  height: 1px;
}

.flex {
  display: flex;
  justify-content: space-between;
}

.quote-block_button {
  display: inline-block;
  margin: 0 auto;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .flex {
    flex-direction: column;
  }
}
</style>
