import {
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
  FlatList,
  TextInput
} from "react-native";
import React, { memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addSchedule, reorderSchedules } from "../../Slices/ScheduleSlice";
import { Ionicons } from "@expo/vector-icons";
import ScheduleItem from "./ScheduleItem";
import { DateTime } from "luxon";
import { useSharedValue } from "react-native-reanimated";
import { swapItems, swapOrders } from "../../Utils/Utils";

function AddSchedule(props) {
  const schedules = useSelector((state) => {
    return state.schedule.schedules;
  });
  const dispatch = useDispatch();
  const dimensions = useWindowDimensions();
  const [taskName, setTaskName] = React.useState("");
  const taskItemWidth = props.width - 20;
  const draggingItem = useSharedValue(null);

  const scheduleOrders = useSharedValue({});
  const sharedSchedules = useSharedValue(JSON.parse(JSON.stringify(schedules)));

  const generateOrders = (_schedules) => {
    let orders = {};
    for (let schedule of _schedules) {
      let index = _schedules.indexOf(schedule);
      orders = {
        ...orders,
        [schedule.id]: index
      };
    }
    return orders;
  };

  React.useEffect(() => {
    scheduleOrders.value = generateOrders(schedules);
    sharedSchedules.value = JSON.parse(JSON.stringify(schedules));
  }, [schedules]);

  const renderAddButton = () => {
    return (
      <View
        style={{
          height: 50,
          borderWidth: 1,
          borderColor: "##919191",
          borderRadius: 10,
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <Ionicons name="add" size={24} color="#919191" />
        <TextInput
          style={{ flex: 1, color: "white" }}
          placeholder="Add task"
          placeholderTextColor={"#919191"}
          value={taskName}
          onChangeText={(text) => {
            setTaskName(text);
          }}
          onSubmitEditing={() => {
            setTimeout(() => setTaskName(""), 50);
            dispatch(
              addSchedule({
                createdAt: DateTime.now().toISO(),
                name: taskName,
                status: "pending",
                startedAt: null,
                finishedAt: null
              })
            );
          }}
        />
      </View>
    );
  };
  return (
    <View
      style={[
        {
          flex: 1,
          width: props.width,
          height: dimensions.height,
          paddingVertical: 80,
          paddingHorizontal: 10
        }
      ]}
    >
      {renderAddButton()}
      <FlatList
        data={schedules}
        keyExtractor={(item, index) => {
          return item.name;
        }}
        renderItem={({ item, index }) => {
          return (
            <ScheduleItem
              id={item.id}
              index={index}
              schedule={item}
              schedules={sharedSchedules}
              width={taskItemWidth}
              draggingItem={draggingItem}
              scheduleOrders={scheduleOrders}
              onDragOver={(fromID) => {
                const newArray = swapOrders(
                  scheduleOrders.value,
                  fromID,
                  item.id
                );
                let fromIndex = scheduleOrders.value[fromID];
                let toIndex = scheduleOrders.value[item.id];

                const newSchedules = swapItems(
                  sharedSchedules.value,
                  fromIndex,
                  toIndex
                );
                sharedSchedules.value = newSchedules;
                scheduleOrders.value = newArray;
              }}
              onDragEnd={() => {
                dispatch(reorderSchedules(sharedSchedules.value));
              }}
            />
          );
        }}
        extraData={taskName}
      />
    </View>
  );
}

export default AddSchedule;
