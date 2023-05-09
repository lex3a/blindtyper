import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { currentTime, getDurationInMinutes } from "../utils/time";
import { calculateAccuracy, calculateCpm, calculateWpm } from "../utils/stats";

const API_URL = "https://baconipsum.com/api/?type=meat-and-filler&paras=1";
const DEFAULT_ACCURACY = 100;

export const useKeyboardTyperStore = defineStore("typer", () => {
  const quote = ref("");
  const isLoading = ref(true);
  const fetchError = ref("");
  const currentChar = ref("");
  const text = ref("");

  const startTime = ref(0);

  const wpm = ref(0);
  const cpm = ref(0);
  const accuracy = ref(DEFAULT_ACCURACY);
  const wordCount = ref(0);
  const errorChars = ref(0);
  const outgoingChars = ref("");
  const isCorrectChar = ref(true);

  const intervalId = ref<number>();

  const stopCpmAndWpmUpdates = () => {
    if (isFinished) {
      clearInterval(intervalId.value);
    }
  };

  const initQuoteStates = (quoteText: string) => {
    // Fix two spaces after the sentence which we got from API
    const newQuote = quoteText.replace(/\s{2}/g, " ");
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

  const reset = () => {
    isLoading.value = true;
    getQuoteData();
    wpm.value = 0;
    cpm.value = 0;
    accuracy.value = DEFAULT_ACCURACY;
    text.value = "";
    wordCount.value = 0;
    currentChar.value = "";
    startTime.value = 0;
    outgoingChars.value = "";
    isCorrectChar.value = true;
    errorChars.value = 0;
  };

  const updateCpmAndWpm = () => {
    if (startTime.value) {
      const durationInMinutes = getDurationInMinutes(startTime.value);
      const newCpm = calculateCpm(outgoingChars.value.length, durationInMinutes);
      const newWpm = calculateWpm(wordCount.value, durationInMinutes);
      cpm.value = newCpm;
      wpm.value = newWpm;
    }
  };

  const handleErrorChar = () => {
    if (!isCorrectChar.value) return; // exit if last try was already incorrect

    const newError = errorChars.value + 1;
    const newAccuracy = calculateAccuracy(newError, quote.value);

    isCorrectChar.value = false;
    accuracy.value = newAccuracy;
    errorChars.value = newError;
  };

  const handleNewChar = (durationInMinutes: number) => {
    let updatedOutgoingChars = outgoingChars.value;
    updatedOutgoingChars += currentChar.value;
    outgoingChars.value = updatedOutgoingChars;
    currentChar.value = text.value.charAt(0);
    text.value = text.value.substring(1);
    isCorrectChar.value = true;

    const newCpm = calculateCpm(updatedOutgoingChars.length, durationInMinutes);
    cpm.value = newCpm;
  };

  const handleNewWord = (durationInMinutes: number) => {
    const newWordCount = wordCount.value + 1;
    const newWpm = calculateWpm(newWordCount, durationInMinutes);
    wordCount.value = newWordCount;
    wpm.value = newWpm;
  };

  const isFinished = computed(() => {
    // Compare only if we received a quote
    return quote.value.length > 0 ? outgoingChars.value.length === quote.value.length : false;
  });

  return {
    getQuoteData,
    reset,
    initStartTime,
    updateCpmAndWpm,
    handleErrorChar,
    handleNewWord,
    handleNewChar,
    stopCpmAndWpmUpdates,
    isFinished,
    wpm,
    cpm,
    accuracy,
    outgoingChars,
    quote,
    fetchError,
    isLoading,
    currentChar,
    text,
    startTime,
    isCorrectChar,
    intervalId,
  };
});
