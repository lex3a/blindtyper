<script setup lang="ts">
import { useKeyboardTyperStore } from '../stores/KeyboardTyperStore';

const store = useKeyboardTyperStore();

</script>

<template>
  <button class="reset" @click="store.reset">Reset</button>
</template>


<style scoped>
.reset {
  display: inline-block;
  margin: 0 auto;
  margin-bottom: 2rem;
}
</style>