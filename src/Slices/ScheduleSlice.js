import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DateTime } from "luxon";
export const scheduleSlice = createSlice({
  name: "schedule",
  initialState: {
    schedules: [],
  },
  reducers: {
    _getSchedules: (state, action) => {
      state.schedules = action.payload;
    },
    _setSchedules: (state, action) => {
      state.schedules = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { _getSchedules, _setSchedules } = scheduleSlice.actions;
export const addSchedule = (data) => async (dispatch) => {
  const oldSchedules = await AsyncStorage.getItem("schedules");
  const schedules = oldSchedules ? oldSchedules : "[]";
  const parsedSchedules = JSON.parse(schedules);
  // Generate timestamp id
  let id = DateTime.now().toMillis();
  parsedSchedules.push({ ...data, id });
  await AsyncStorage.setItem("schedules", JSON.stringify(parsedSchedules));

  dispatch(getSchedule());
};

export const deleteSchedule = (id) => async (dispatch) => {
  const oldSchedules = await AsyncStorage.getItem("schedules");
  const schedules = oldSchedules ? oldSchedules : "[]";
  const parsedSchedules = JSON.parse(schedules);
  const index = parsedSchedules.findIndex((item) => item.id === id);
  parsedSchedules.splice(index, 1);
  await AsyncStorage.setItem("schedules", JSON.stringify(parsedSchedules));

  dispatch(getSchedule());
};

export const getSchedule = () => async (dispatch) => {
  const _schedules = await AsyncStorage.getItem("schedules");
  const schedules = _schedules ? _schedules : "[]";
  // Find today's schedules
  const todaysSchedules = JSON.parse(schedules).filter((schedule) => {
    const today = DateTime.now().startOf("day").toISODate();
    const scheduleDate = DateTime.fromISO(schedule.createdAt).toISODate();
    return scheduleDate === today;
  });
  dispatch(_getSchedules(todaysSchedules));
};

export const startSchedule = (id) => async (dispatch) => {
  const oldSchedules = await AsyncStorage.getItem("schedules");
  const schedules = oldSchedules ? oldSchedules : "[]";
  const parsedSchedules = JSON.parse(schedules);
  const index = parsedSchedules.findIndex((item) => item.id === id);
  parsedSchedules[index].status = "started";
  parsedSchedules[index].startedAt = DateTime.now().toISO();
  await AsyncStorage.setItem("schedules", JSON.stringify(parsedSchedules));
  dispatch(getSchedule());
};

export const finishSchedule = (id) => async (dispatch) => {
  const oldSchedules = await AsyncStorage.getItem("schedules");
  const schedules = oldSchedules ? oldSchedules : "[]";
  const parsedSchedules = JSON.parse(schedules);
  const index = parsedSchedules.findIndex((item) => item.id === id);
  parsedSchedules[index].status = "finished";
  parsedSchedules[index].finishedAt = DateTime.now().toISO();
  await AsyncStorage.setItem("schedules", JSON.stringify(parsedSchedules));
  dispatch(getSchedule());
};

export const reorderSchedules = (newArray) => async (dispatch) => {
  await AsyncStorage.setItem("schedules", JSON.stringify(newArray));
  dispatch(_setSchedules(newArray));
};

export default scheduleSlice.reducer;
