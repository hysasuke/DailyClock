import React, { useEffect } from "react";
import { Circle, G, Path } from "react-native-svg";
import {
  calculateAngle,
  describeArc,
  polarToCartesian
} from "../../Utils/Geometry";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { Colors } from "../../constants/Constants";
export default function ScheduleIndicators(props) {
  let [date, setDate] = React.useState(DateTime.now());
  let dateRefreshInterval = React.useRef(null);
  React.useEffect(() => {
    dateRefreshInterval.current = setInterval(() => {
      setDate(DateTime.now());
    }, 1000);
    return () => {
      clearInterval(dateRefreshInterval.current);
    };
  }, []);
  const schedules = useSelector((state) => {
    return state.schedule.schedules;
  });

  const startingIndicators = schedules.map((item, index) => {
    const startTime = DateTime.fromISO(item.startedAt);
    const radius = props.radius - 100 - index * 20;
    const { x, y } = polarToCartesian(
      props.centerX,
      props.centerY,
      radius,
      startTime.hour * 30 + startTime.minute / 2 + startTime.second / 120
    );

    return (
      <Circle
        cx={x}
        cy={y}
        r={5}
        fill={Colors.indicatorColors.started}
        key={"starting" + index}
      />
    );
  });

  const finishedIndicators = schedules.map((item, index) => {
    const endTime = DateTime.fromISO(item.finishedAt);
    const radius = props.radius - 100 - index * 20;
    const { x, y } = polarToCartesian(
      props.centerX,
      props.centerY,
      radius,
      endTime.hour * 30 + endTime.minute / 2 + endTime.second / 120
    );

    return (
      <Circle
        cx={x}
        cy={y}
        r={5}
        fill={Colors.indicatorColors.finished}
        key={"finished" + index}
      />
    );
  });

  const timePassedIndicators = schedules
    .filter((item) => item.status !== "pending")
    .map((item, index) => {
      const startTime = DateTime.fromISO(item.startedAt);

      const startAngle = calculateAngle(startTime.hour, startTime.minute);

      const endTime =
        item.status === "finished" ? DateTime.fromISO(item.finishedAt) : date;
      const endAngle = calculateAngle(endTime.hour, endTime.minute);
      const radius = props.radius - 100 - index * 20;
      const arc = describeArc(
        props.centerX,
        props.centerY,
        radius,
        startAngle,
        endAngle
      );

      return (
        <Path
          d={arc}
          stroke={Colors.indicatorColors.inProgress}
          strokeWidth={10}
          key={"timePassed" + index}
          strokeLinecap={"round"}
        />
      );
    });
  return (
    <G>
      {timePassedIndicators}
      {startingIndicators}
      {finishedIndicators}
    </G>
  );
}
