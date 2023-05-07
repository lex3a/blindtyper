<script setup lang="ts">
interface IInfoHeaderProps {
  cpm?: number;
  wpm?: number;
  accuracy?: number;
}

defineProps<IInfoHeaderProps>()
</script>

<template>
  <div class="infoHeader">
    <div class="type-speed">
      <p>Speed:</p>
      <div>
        <p>{{ cpm }} CPM</p>
        <p>{{ wpm }} WPM</p>
      </div>
    </div>
    <div class="type-accuracy">
      <p>Accuracy:</p>
      <p>{{ accuracy }}%</p>
    </div>
  </div>
</template>


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