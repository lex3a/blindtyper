export const currentTime = () => new Date().getTime();
export const getDurationInMinutes = (startTime: number) => {
  return (currentTime() - startTime) / 60000.0;
};
