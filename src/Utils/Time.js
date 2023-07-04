export function to12hClock(hour) {
  "worklet";
  return hour > 12 ? hour - 12 : hour;
}

export const getTimeInDegree = (date) => {
  "worklet";
  let hours = (to12hClock(date.getHours()) / 12) * 360;
  let minutesPassed = date.getMinutes() / 60;
  hours = hours + minutesPassed * 30;
  let minutes = (date.getMinutes() / 60) * 360;
  let seconds = (date.getSeconds() / 60) * 360;
  const nextSecondsValue = seconds + 6;

  return { hours, minutes, seconds };
};
