import React from "react";
import { G, Line } from "react-native-svg";
import { polarToCartesian } from "../../Utils/Geometry";
import Animated, { useAnimatedProps } from "react-native-reanimated";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);
const Hand = (props) => {
  const animatedGProps = useAnimatedProps(() => {
    return {
      rotation: props.rotation ? props.rotation.value : 0,
      originX: props.centerX,
      originY: props.centerY
    };
  });
  return (
    <AnimatedG animatedProps={animatedGProps}>
      <AnimatedLine
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        strokeLinecap={"round"}
        x1={props.startX ? props.startX : props.centerX}
        y1={props.startY ? props.startY : props.centerY}
        x2={props.endCoords.x.value}
        y2={props.endCoords.y.value}
      />
    </AnimatedG>
  );
};

export default Hand;
