export const checkWorldRecord = (cpm: number) => {
  const WORLD_RECORD_CPM = 1080;

  const percentage = Math.round(100 - (cpm / WORLD_RECORD_CPM) * 100);

  if (cpm < WORLD_RECORD_CPM) {
    return `Typing world record is ${WORLD_RECORD_CPM} CPM. You typing speed is by ${percentage}% slower than this.`;
  } else {
    return `Typing world record is ${WORLD_RECORD_CPM} CPM. You typing speed is by ${percentage}% faster than this.`;
  }
};
