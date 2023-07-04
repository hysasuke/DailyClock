import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import {
  deleteSchedule,
  startSchedule,
  finishSchedule,
} from "../../Slices/ScheduleSlice";
import { useDispatch } from "react-redux";
import { Colors } from "../../constants/Constants";
const HEIGHT = 70;
const STARTING_TOP = 10;
export default function ScheduleItem({
  index,
  schedule,
  schedules,
  width,
  draggingItem,
  id,
  scheduleOrders,
  onDragOver,
  onDragEnd,
}) {
  const dispatch = useDispatch();
  const itemTop = useSharedValue(0);
  const innerViewLeft = useSharedValue(0);
  const shouldTriggerDelete = useSharedValue(false);
  const itemTopCopy = useSharedValue(0);
  const onDragOverTriggered = useSharedValue(false);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: HEIGHT,
      position: "absolute",
      top: itemTop.value,
      width: width,
      justifyContent: "center",
      paddingVertical: 10,
      borderWidth: draggingItem.value?.id === id ? 1 : 0,
    };
  });

  const innerViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      borderRadius: 10,
      backgroundColor: "white",
      justifyContent: "center",
      paddingHorizontal: 10,
      left: innerViewLeft.value,
    };
  });
  const deleteViewInitialWidth = 74;
  let deleteViewWidth = useSharedValue(deleteViewInitialWidth);
  let deleteViewRight = useSharedValue(-deleteViewInitialWidth);
  const deleteViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      height: HEIGHT - 20,
      width: deleteViewWidth.value,
      zIndex: -1,
      right: deleteViewRight.value,
      flexDirection: "row",
      alignItems: "center",
    };
  });

  const deleteViewBackgroundAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      deleteViewWidth.value,
      [deleteViewInitialWidth, width / 2],
      ["#919191", "#F63B3B"]
    );
    return {
      backgroundColor: backgroundColor,
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      flex: 1,
      borderRadius: 10,
    };
  });

  useAnimatedReaction(
    () => {
      return scheduleOrders.value;
    },
    (orders, previousOrders) => {
      itemTop.value = withSpring(orders[id] * HEIGHT + STARTING_TOP);
    },
    [scheduleOrders.value]
  );

  useAnimatedReaction(
    () => {
      return draggingItem.value;
    },
    (draggingItem) => {
      if (draggingItem) {
        if (
          draggingItem.currentTop >= itemTop.value &&
          draggingItem.currentTop < itemTop.value + HEIGHT &&
          draggingItem.id !== id
        ) {
          if (!onDragOverTriggered.value) {
            runOnJS(onDragOver)(draggingItem.id);
          }
          onDragOverTriggered.value = true;
        } else {
          onDragOverTriggered.value = false;
        }
      }
    },
    []
  );

  const deleteScheduleWrapper = (id) => {
    dispatch(deleteSchedule(id));
  };

  const swipeGesture = Gesture.Pan()
    .onBegin((gesture) => {})
    .onUpdate((gesture) => {
      if (gesture.translationX < 0) {
        // Handle swipe left
        innerViewLeft.value = gesture.translationX;
        if (Math.abs(gesture.translationX) > width / 2) {
          shouldTriggerDelete.value = true;
        } else {
          shouldTriggerDelete.value = false;
        }

        // Handle delete view animation
        if (Math.abs(gesture.translationX) < deleteViewInitialWidth) {
          deleteViewRight.value =
            -deleteViewInitialWidth - gesture.translationX;
        } else {
          const targetDeleteViewWidth = Math.abs(gesture.translationX);
          deleteViewRight.value = 0;
          if (targetDeleteViewWidth <= width) {
            deleteViewWidth.value = targetDeleteViewWidth;
          }
        }
      }
    })
    .onEnd((gesture) => {
      if (shouldTriggerDelete.value) {
        innerViewLeft.value = withTiming(-width, {
          duration: 200,
          easing: Easing.bezier(0.64, 0.01, 1, 0.34),
        });
        deleteViewRight.value = withTiming(0, {
          duration: 200,
          easing: Easing.bezier(0.64, 0.01, 1, 0.34),
        });
        deleteViewWidth.value = withTiming(
          width + 24,
          {
            duration: 200,
            easing: Easing.bezier(0.64, 0.01, 1, 0.34),
          },
          () => {
            runOnJS(deleteScheduleWrapper)(id);
          }
        );
      } else {
        innerViewLeft.value = withTiming(0, {
          duration: 200,
          easing: Easing.bezier(0.64, 0.01, 1, 0.34),
        });
        deleteViewWidth.value = withTiming(deleteViewInitialWidth, {
          duration: 200,
          easing: Easing.bezier(0.64, 0.01, 1, 0.34),
        });
        deleteViewRight.value = withTiming(-deleteViewInitialWidth, {
          duration: 200,
          easing: Easing.bezier(0.64, 0.01, 1, 0.34),
        });
      }
    });

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(500)
    .onStart((gesture) => {
      draggingItem.value = { id: id, currentTop: itemTop.value, index: index };
      itemTopCopy.value = itemTop.value;
    })
    .onUpdate((gesture) => {
      let newItemTop = itemTopCopy.value + gesture.translationY;
      itemTop.value = newItemTop;
      draggingItem.value = { ...draggingItem.value, currentTop: newItemTop };
    })
    .onEnd((gesture) => {
      draggingItem.value = null;
      let position = scheduleOrders.value[id];
      itemTop.value = withSpring(position * HEIGHT + STARTING_TOP, {
        damping: 20,
        stiffness: 150,
      });
      runOnJS(onDragEnd)();
    });

  const composedGesture = Gesture.Race(swipeGesture, dragGesture);

  const renderStatusIndicator = () => {
    const styleMap = {
      pending: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.indicatorColors.pending,
      },
      started: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.indicatorColors.started,
      },
      finished: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.indicatorColors.finished,
      },
    };
    return <View style={styleMap[schedule.status]}></View>;
  };

  const handleScheduleOnPress = () => {
    if (schedule.status === "pending") {
      dispatch(startSchedule(id));
    } else if (schedule.status === "started") {
      dispatch(finishSchedule(id));
    }
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={innerViewAnimatedStyle}>
          <TouchableOpacity
            disabled={schedule.status === "finished"}
            onPress={() => handleScheduleOnPress()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            {renderStatusIndicator()}
            <Text
              style={{
                color: "black",
                marginLeft: 5,
                textDecorationLine:
                  schedule.status === "finished" ? "line-through" : "none",
              }}
            >
              {schedule.name}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
      <Animated.View style={deleteViewAnimatedStyle}>
        <Feather name="link-2" size={24} color="white" />
        <Animated.View style={deleteViewBackgroundAnimatedStyle}>
          <MaterialIcons name="delete-forever" size={24} color="white" />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
