import React from "react";
import { G, Line, Text } from "react-native-svg";
import { polarToCartesian } from "../../Utils/Geometry";

const ClockTicks = (props) => {
  const minutes = new Array(props.minutes).fill(1);
  const hours = new Array(props.hours).fill(1);
  const minuteSticks = minutes.map((minute, index) => {
    const start = polarToCartesian(
      props.centerX,
      props.centerY,
      props.radius - 10,
      index * 6
    );
    const end = polarToCartesian(
      props.centerX,
      props.centerY,
      props.radius,
      index * 6
    );
    return (
      <Line
        stroke="white"
        strokeWidth={4}
        strokeLinecap="round"
        key={index}
        x1={start.x}
        x2={end.x}
        y1={start.y}
        y2={end.y}
      />
    );
  });

  const hourSticks = hours.map((hour, index) => {
    const start = polarToCartesian(
      props.centerX,
      props.centerY,
      props.radius - 20,
      index * 30
    );

    const end = polarToCartesian(
      props.centerX,
      props.centerY,
      props.radius,
      index * 30
    );

    const time = polarToCartesian(
      props.centerX,
      props.centerY,
      props.radius - 55,
      index * 30
    );

    return (
      <G key={index}>
        <Line
          stroke="white"
          strokeWidth={9}
          strokeLinecap="round"
          x1={start.x}
          x2={end.x}
          y1={start.y}
          y2={end.y}
        />

        <Text
          textAnchor="middle"
          fontSize="35"
          fontWeight="bold"
          fill="white"
          alignmentBaseline="central"
          x={time.x}
          y={time.y}
        >
          {index === 0 ? 12 : index}
        </Text>
      </G>
    );
  });

  return (
    <G>
      {minuteSticks}
      {hourSticks}
    </G>
  );
};

export default ClockTicks;
