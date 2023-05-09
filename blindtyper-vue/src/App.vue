<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import InfoHeader from './components/InfoHeader.vue'
import Quote from './components/Quote.vue'
import { currentTime, getDurationInMinutes } from './utils/time';
import { checkWorldRecord } from './utils/record';
import { calculateAccuracy, calculateCpm, calculateWpm } from './utils/stats';


const DEFAULT_ACCURACY = 100;
const API_URL = 'https://baconipsum.com/api/?type=meat-and-filler&paras=1';

const quote = ref('');
const wpm = ref(0);
const cpm = ref(0);
const accuracy = ref(DEFAULT_ACCURACY);
const isLoading = ref(true);
const text = ref('');
const wordCount = ref(0);
const currentChar = ref('');
const startTime = ref(0);
const outgoingChars = ref('');
const isCorrectChar = ref(true);
const errorChars = ref(0);
const fetchError = ref('');
const intervalId = ref<number>();
const input = ref<HTMLInputElement | null>(null);

const initQuoteStates = (quoteText: string) => {
  const newQuote = quoteText.replace(/\s{2}/g, ' ');
  quote.value = newQuote;
  currentChar.value = newQuote.charAt(0);
  text.value = newQuote.substring(1);
};

const getQuoteData = async () => {
  try {
    const response = await fetch(API_URL);
    const [data] = await response.json();
    initQuoteStates(data);
    isLoading.value = false;
  } catch (error) {
    fetchError.value = `An error fetching quote. ${error}`;
  }
};

const initStartTime = () => {
  if (!startTime.value) {
    startTime.value = currentTime();
  }
};

const isFinished = () => {
  const finished = outgoingChars.value.length === quote.value.length;

  if (finished) {
    clearInterval(intervalId.value);
  }

  return finished;
};

const reset = () => {
  isLoading.value = true;
  getQuoteData();
  wpm.value = 0;
  cpm.value = 0;
  accuracy.value = DEFAULT_ACCURACY;
  text.value = '';
  wordCount.value = 0;
  currentChar.value = '';
  startTime.value = 0;
  outgoingChars.value = '';
  isCorrectChar.value = true;
  errorChars.value = 0;
}

const handleBlur = (event: Event) => {
  (event.target as HTMLInputElement).focus();
};

const updateCpmAndWpm = () => {
  if (startTime.value) {
    const durationInMinutes = getDurationInMinutes(startTime.value);
    const newCpm = calculateCpm(outgoingChars.value.length, durationInMinutes);
    const newWpm = calculateWpm(wordCount.value, durationInMinutes);
    cpm.value = newCpm;
    wpm.value = newWpm;

  }
}

function disableTabKey(this: Window, event: KeyboardEvent) {
  const { key } = event;
  if (key === "Tab") {
    event.preventDefault();
  }
}

const handleErrorChar = () => {
  if (!isCorrectChar.value) return; // exit if last try was already incorrect

  const newError = errorChars.value + 1;
  const newAccuracy = calculateAccuracy(newError, quote.value);

  isCorrectChar.value = false;
  accuracy.value = newAccuracy;
  errorChars.value = newError;
}

const handleNewChar = (durationInMinutes: number) => {
  let updatedOutgoingChars = outgoingChars.value;
  updatedOutgoingChars += currentChar.value;
  outgoingChars.value = updatedOutgoingChars;
  currentChar.value = text.value.charAt(0)
  text.value = text.value.substring(1)
  isCorrectChar.value = true;

  const newCpm = calculateCpm(updatedOutgoingChars.length, durationInMinutes);
  cpm.value = (newCpm);
}

const handleNewWord = (durationInMinutes: number) => {
  const newWordCount = wordCount.value + 1;
  const newWpm = calculateWpm(newWordCount, durationInMinutes);
  wordCount.value = newWordCount;
  wpm.value = newWpm;
}

const handleKeyDown = (event: KeyboardEvent) => {
  const { key } = event;
  initStartTime();

  // Check only real characters, don't check e.g. "Tab", "Shift", etc.
  if (key.length === 1) {
    const durationInMinutes = getDurationInMinutes(startTime.value);
    if (key === currentChar.value) {
      handleNewChar(durationInMinutes);

      if (text.value.charAt(0) === " ") {
        handleNewWord(durationInMinutes);
      }
    } else {
      handleErrorChar();
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
  getQuoteData();
  intervalId.value = setInterval(updateCpmAndWpm, 200);
});

onUnmounted(() => {
  window.removeEventListener("keydown", disableTabKey);
  clearInterval(intervalId.value);
});

</script>

<template>
  <template v-if="fetchError">{{ fetchError }}</template>
  <template v-else-if="isLoading">Loading...</template>
  <template v-else-if="isFinished()">
    <p>{{ checkWorldRecord(cpm) }}</p>
    <InfoHeader :cpm="cpm" :wpm="wpm" :accuracy="accuracy" />
    <button @click="reset">Reset</button>
  </template>
  <template v-else>
    <div class="flex">
      <input name="hiddenType" ref="input" id="hiddenType" autoFocus="true" autoComplete="off" @keydown="handleKeyDown"
        @blur="handleBlur" />
      <div class="quote-block">
        <Quote :text="text" :char="currentChar" :outgoingChars="outgoingChars" :isCorrectChar="isCorrectChar" />
        <button class="quote-block_button" @click="reset">Reset</button>
      </div>
      <InfoHeader :wpm="wpm" :cpm="cpm" :accuracy="accuracy" />
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
