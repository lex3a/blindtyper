<script setup lang="ts">
interface IQuoteProps {
  text: string;
  char: string;
  isCorrectChar: boolean;
  outgoingChars: string;
}

defineProps<IQuoteProps>();


</script>

<template>
  <div class="quote">
    <p>
      <span class="green">{{ outgoingChars }}</span>
      <span :class="isCorrectChar ? 'normal' : 'red'">
        <span class="caret"></span>{{ char }}
      </span>
      <span>{{ text }}</span>
    </p>
  </div>
</template>

<style scoped>
.quote {
  font-size: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  padding: 1rem 3rem;
}

.red {
  background-color: red;
}

.green {
  background-color: green;
}

.normal {
  background-color: inherit;
}

.caret {
  background-color: yellow;
  display: inline-block;
  width: 2px;
  height: 16px;
  animation-name: caret;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
}

@keyframes caret {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .quote {
    order: 2;
    margin-right: 2rem;
  }
}
</style>