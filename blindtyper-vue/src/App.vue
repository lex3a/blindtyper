<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import InfoHeader from './components/InfoHeader.vue'
import ResetButton from './components/ResetButton.vue'
import Typer from './components/Typer.vue'
import { checkWorldRecord } from './utils/record';
import { useKeyboardTyperStore } from './stores/KeyboardTyperStore';

const intervalId = ref<number>();

const store = useKeyboardTyperStore();

const isFinished = () => {
  let finished = false;

  // Compare only if we received a quote
  if (store.quote.length > 0) {
    finished = store.outgoingChars.length === store.quote.length;
  }

  if (finished) {
    clearInterval(intervalId.value);
  }

  return finished;
};

function disableTabKey(this: Window, event: KeyboardEvent) {
  const { key } = event;
  if (key === "Tab") {
    event.preventDefault();
  }
}

onMounted(() => {
  window.addEventListener("keydown", disableTabKey);
  intervalId.value = setInterval(store.updateCpmAndWpm, 200);
});

onUnmounted(() => {
  window.removeEventListener("keydown", disableTabKey);
  clearInterval(intervalId.value);
});

</script>

<template>
  <template v-if="isFinished()">
    <p>{{ checkWorldRecord(store.cpm) }}</p>
    <InfoHeader />
    <ResetButton />
  </template>
  <Typer v-else />
</template>

