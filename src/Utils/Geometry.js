export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  "worklet";
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

export function describeArc(x, y, radius, startAngle, endAngle) {
  let start = polarToCartesian(x, y, radius, startAngle);
  let end = polarToCartesian(x, y, radius, endAngle);
  let sweepFlag = endAngle - startAngle < 180 ? 0 : 1;
  let x1 = start.x;
  let y1 = start.y;
  let x2 = end.x;
  let y2 = end.y;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${sweepFlag} 1 ${x2} ${y2}`;
}

export function calculateAngle(hour, minute) {
  let hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
  return hourAngle;
}
