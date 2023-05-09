<script setup lang="ts">
import { onMounted } from 'vue';
import { checkWorldRecord } from '../utils/record';
import { useKeyboardTyperStore } from '../stores/KeyboardTyperStore';
import InfoHeader from './InfoHeader.vue'
import ResetButton from './ResetButton.vue'


const store = useKeyboardTyperStore();

onMounted(() => {
  store.stopCpmAndWpmUpdates();
});

</script>

<template >
  <p>{{ checkWorldRecord(store.cpm) }}</p>
  <InfoHeader />
  <ResetButton />
</template>