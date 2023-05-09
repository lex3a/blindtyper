<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useKeyboardTyperStore } from './stores/KeyboardTyperStore';
import Typer from './components/Typer.vue'
import Summary from './components/Summary.vue'


const store = useKeyboardTyperStore();

function disableTabKey(this: Window, event: KeyboardEvent) {
  const { key } = event;
  if (key === "Tab") {
    event.preventDefault();
  }
}

onMounted(() => {
  /* 
  Disable a Tab key for Firefox, Tab key will still work in Firefox
  if we add an event listener to the another element.
*/
  window.addEventListener("keydown", disableTabKey);
  store.intervalId = setInterval(store.updateCpmAndWpm, 200);
});

onUnmounted(() => {
  window.removeEventListener("keydown", disableTabKey);
  clearInterval(store.intervalId);
});

</script>

<template>
  <Summary v-if="store.isFinished" />
  <Typer v-else />
</template>

