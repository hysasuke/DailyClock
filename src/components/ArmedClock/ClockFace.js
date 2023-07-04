import { View, Text } from "react-native";
import React from "react";
import { Circle } from "react-native-svg";
export default function ClockFace(props) {
  return (
    <Circle
      cx={props.centerX}
      cy={props.centerY}
      r={props.radius}
      fill="black"
    />
  );
}
