import React, { memo, useEffect, useState } from "react";
import Svg, { Circle, G, SvgAst } from "react-native-svg";
import { Dimensions, TouchableOpacity, View, StyleSheet } from "react-native";
import ClockTicks from "./ClockTicks";
import Hand from "./Hand";
import { getTimeInDegree } from "../../Utils/Time";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ClockFace from "./ClockFace";
import { AntDesign } from "@expo/vector-icons";
import AddSchedule from "../Schedule/AddSchedule";
import { useDispatch } from "react-redux";
import { getSchedule } from "../../Slices/ScheduleSlice";

import ScheduleIndicators from "./ScheduleIndicators";
import { DateTime } from "luxon";
const { width, height } = Dimensions.get("window");

const diameter = height - 100;
const centerX = width / 2;
const centerY = height / 2;
const radius = diameter / 2;

const hourTickCount = 12;
const minuteTickCount = 12 * 6;

const secondArmLength = radius - 20;
const minuteArmLength = radius - 30;
const hourArmLength = radius / 1.5;

const AnimatedSVG = Animated.createAnimatedComponent(Svg);

const ADD_SCHEDULE_VIEW_WIDTH = 500;
const Clock = (props) => {
  const dispatch = useDispatch();
  let [isFullScreen, setIsFullScreen] = useState(true);
  let dateObj = new Date();
  let date = useSharedValue(dateObj.getDate());
  let time = useSharedValue(getTimeInDegree(dateObj));
  let secondsEndX = useSharedValue(centerX);
  let secondsEndY = useSharedValue(centerY - secondArmLength);
  let minutesEndX = useSharedValue(centerX);
  let minutesEndY = useSharedValue(centerY - minuteArmLength);
  let hoursEndX = useSharedValue(centerX);
  let hoursEndY = useSharedValue(centerY - hourArmLength);
  let secondsRotation = useSharedValue(0);
  let minutesRotation = useSharedValue(0);
  let hoursRotation = useSharedValue(0);

  let svgScale = useSharedValue(1);
  let translateX = useSharedValue(0);
  let addScheduleViewRight = useSharedValue(-ADD_SCHEDULE_VIEW_WIDTH);
  let springOptions = {
    damping: 9,
    mass: 0.1,
    stiffness: 350,
    overshootClamping: false,
    restSpeedThreshold: 0.1,
    restDisplacementThreshold: 6,
  };

  let svgAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: svgScale.value },
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  let addScheduleViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      right: addScheduleViewRight.value,
      position: "absolute",
    };
  });
  const _getSchedules = () => {
    dispatch(getSchedule());
  };

  useFrameCallback(() => {
    let now = new Date();
    if (date.value !== now.getDate()) {
      date.value = now.getDate();
      runOnJS(_getSchedules)();
    }
    time.value = getTimeInDegree(now);
  }, true);

  useEffect(() => {
    dispatch(getSchedule());
  }, []);

  useEffect(() => {
    startResizeAnimation(isFullScreen);
  }, [isFullScreen]);

  const startResizeAnimation = (fullScreen) => {
    if (fullScreen) {
      svgScale.value = withTiming(1, { duration: 500 });
      translateX.value = withTiming(0, { duration: 500 });
      addScheduleViewRight.value = withTiming(-ADD_SCHEDULE_VIEW_WIDTH, {
        duration: 500,
      });
    } else {
      svgScale.value = withTiming(0.75, { duration: 500 });
      translateX.value = withTiming(-centerX / 2, { duration: 500 });
      addScheduleViewRight.value = withTiming(0, { duration: 500 });
    }
  };

  useAnimatedReaction(
    () => {
      let { hours, minutes, seconds } = time.value;
      return { hours, minutes, seconds };
    },
    (time, previous) => {
      if (!previous || time.seconds !== previous.seconds) {
        let { hours, minutes, seconds } = time;
        secondsRotation.value = withSpring(seconds, springOptions, (status) => {
          if (status) {
            if (secondsRotation.value === 354) {
              secondsRotation.value = 354 - 360;
            }
          }
        });

        minutesRotation.value =
          minutes === 0
            ? 0
            : withSpring(minutes, springOptions, (status) => {
                if (status) {
                  if (
                    minutesRotation.value === 354 &&
                    secondsRotation.value === 354
                  ) {
                    minutesRotation.value = 354 - 360;
                  }
                }
              });

        hoursRotation.value =
          hours === 0
            ? 0
            : withSpring(hours, springOptions, (status) => {
                if (status) {
                  if (
                    hoursRotation.value === 354 &&
                    minutesRotation.value === 354 &&
                    secondsRotation.value === 354
                  ) {
                    hoursRotation.value = 354 - 360;
                  }
                }
              });
      }
    },
    []
  );

  const renderAddButton = () => {
    return (
      <TouchableOpacity
        style={{ position: "absolute", top: 30, right: 30 }}
        onPress={() => {
          setIsFullScreen(!isFullScreen);
        }}
      >
        <AntDesign
          name={isFullScreen ? "shrink" : "arrowsalt"}
          size={26}
          color="white"
        />
      </TouchableOpacity>
    );
  };

  const renderAddScheduleView = () => {
    return (
      <Animated.View style={addScheduleViewAnimatedStyle}>
        <AddSchedule width={ADD_SCHEDULE_VIEW_WIDTH} />
      </Animated.View>
    );
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]}>
      <AnimatedSVG style={svgAnimatedStyle}>
        <ClockFace centerX={centerX} centerY={centerY} radius={radius} />
        <ScheduleIndicators
          centerX={centerX}
          centerY={centerY}
          radius={radius}
        />
        <ClockTicks
          minutes={minuteTickCount}
          hours={hourTickCount}
          radius={radius}
          centerX={centerX}
          centerY={centerY}
        />
        <Hand
          centerX={centerX}
          centerY={centerY}
          endCoords={{ x: minutesEndX, y: minutesEndY }}
          stroke="white"
          strokeWidth="5"
          rotation={minutesRotation}
        />
        <Hand
          centerX={centerX}
          centerY={centerY}
          endCoords={{ x: hoursEndX, y: hoursEndY }}
          stroke="white"
          strokeWidth="7"
          rotation={hoursRotation}
        />
        <Hand
          centerX={centerX}
          centerY={centerY}
          startX={centerX}
          startY={centerY + 20}
          endCoords={{ x: secondsEndX, y: secondsEndY }}
          stroke="red"
          strokeWidth="3"
          rotation={secondsRotation}
        />
      </AnimatedSVG>
      {renderAddScheduleView()}
      {renderAddButton()}
    </View>
  );
};

export default Clock;
