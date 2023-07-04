import { configureStore } from "@reduxjs/toolkit";
import scheduleReducer from "./Slices/ScheduleSlice";
export default configureStore({
  reducer: {
    schedule: scheduleReducer
  }
});
