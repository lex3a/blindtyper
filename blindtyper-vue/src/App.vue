<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import InfoHeader from './components/InfoHeader.vue'
import Quote from './components/Quote.vue'
import { getDurationInMinutes } from './utils/time';
import { checkWorldRecord } from './utils/record';
import { useKeyboardTyperStore } from './stores/KeyboardTyperStore';

const intervalId = ref<number>();
const input = ref<HTMLInputElement | null>(null);

const store = useKeyboardTyperStore();

const isFinished = () => {
  const finished = store.outgoingChars.length === store.quote.length;

  if (finished) {
    clearInterval(intervalId.value);
  }

  return finished;
};

const handleBlur = (event: Event) => {
  (event.target as HTMLInputElement).focus();
};

function disableTabKey(this: Window, event: KeyboardEvent) {
  const { key } = event;
  if (key === "Tab") {
    event.preventDefault();
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  const { key } = event;

  store.initStartTime();

  // Check only real characters, don't check e.g. "Tab", "Shift", etc.
  if (key.length === 1) {
    const durationInMinutes = getDurationInMinutes(store.startTime);
    if (key === store.currentChar) {
      store.handleNewChar(durationInMinutes);

      if (store.text.charAt(0) === " ") {
        store.handleNewWord(durationInMinutes);
      }
    } else {
      store.handleErrorChar();
    }
  }
}

// Return focus after lifecycle change too
watchEffect(() => {
  if (input.value) {
    input.value.focus()
  }
})

onMounted(() => {
  window.addEventListener("keydown", disableTabKey);
  store.getQuoteData();
  intervalId.value = setInterval(store.updateCpmAndWpm, 200);
});

onUnmounted(() => {
  window.removeEventListener("keydown", disableTabKey);
  clearInterval(intervalId.value);
});

</script>

<template>
  <template v-if="store.fetchError">{{ store.fetchError }}</template>
  <template v-else-if="store.isLoading">Loading...</template>
  <template v-else-if="isFinished()">
    <p>{{ checkWorldRecord(store.cpm) }}</p>
    <InfoHeader :cpm="store.cpm" :wpm="store.wpm" :accuracy="store.accuracy" />
    <button @click="store.reset">Reset</button>
  </template>
  <template v-else>
    <div class="flex">
      <input name="hiddenType" ref="input" id="hiddenType" autoFocus="true" autoComplete="off" @keydown="handleKeyDown"
        @blur="handleBlur" />
      <div class="quote-block">
        <Quote :text="store.text" :char="store.currentChar" :outgoingChars="store.outgoingChars"
          :isCorrectChar="store.isCorrectChar" />
        <button class="quote-block_button" @click="store.reset">Reset</button>
      </div>
      <InfoHeader :wpm="store.wpm" :cpm="store.cpm" :accuracy="store.accuracy" />
    </div>
  </template>
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
