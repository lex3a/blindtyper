export const calculateWpm = (wordCount: number, durationInMinutes: number) => {
  return Math.round(wordCount / durationInMinutes);
};

export const calculateCpm = (charCount: number, durationInMinutes: number) => {
  return Math.round(charCount / durationInMinutes);
};

export const calculateAccuracy = (errorChars: number, originalText: string) => {
  return Math.max((1000 - Math.round((1000 * errorChars) / originalText.length)) / 10, 0);
};
