<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { useKeyboardTyperStore } from '../stores/KeyboardTyperStore';
import { getDurationInMinutes } from '../utils/time';
import InfoHeader from './InfoHeader.vue'
import Quote from './Quote.vue'
import ResetButton from './ResetButton.vue'

const input = ref<HTMLInputElement | null>(null);

const store = useKeyboardTyperStore();

// Return focus after lifecycle change too
watchEffect(() => {
  if (input.value) {
    input.value.focus()
  }
})

const handleBlur = (event: Event) => {
  (event.target as HTMLInputElement).focus();
};

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

onMounted(() => {
  store.getQuoteData();
});

</script>

<template>
  <p v-if="store.fetchError">{{ store.fetchError }}</p>
  <p v-else-if="store.isLoading">Loading...</p>
  <div class="flex" v-else>
    <input name="hiddenType" ref="input" id="hiddenType" autoFocus="true" autoComplete="off" @blur="handleBlur"
      @keydown="handleKeyDown" />
    <div class="quote-block">
      <Quote :text="store.text" :char="store.currentChar" :outgoingChars="store.outgoingChars"
        :isCorrectChar="store.isCorrectChar" />
      <ResetButton />
    </div>
    <InfoHeader />
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

@media (max-width: 768px) {
  .flex {
    flex-direction: column;
  }
}
</style>