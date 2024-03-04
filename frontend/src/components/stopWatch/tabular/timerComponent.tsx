import { TaskDto } from "models/tasks";
import React, { useEffect, useState } from "react";

import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { getTotalSpentTime } from "@/services/timeActions";

type Props = {
  milliseconds: number;
  task?: TaskDto;
};
function Stopwatch({ milliseconds, task }: Props) {
  const timeFormat = useAppSelector(
    (state: RootState) => state.settingsSlice.timeFormat
  );

  const [time, setTime] = useState(milliseconds);

  const formatTime = (time: number) => {
    const formattedTime = [];
    let tmp = Math.floor(time / 1000);
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let sm = 0;

    if (timeFormat === "Day") {
      days = Math.floor(tmp / (8 * 3600));
      tmp %= 8 * 3600;
      hours = Math.floor(tmp / 3600);
      tmp %= 3600;
      sm = Number((tmp / 60).toFixed(1));
      minutes = Math.floor(tmp / 60);
    } else if (timeFormat === "Hour") {
      hours = Math.floor(tmp / 3600);
      tmp %= 3600;
      minutes = Math.floor(tmp / 60);
      sm = tmp / 60;
    }

    days > 0 && formattedTime.push(days + "d");
    hours > 0 && formattedTime.push(hours + "h");
    minutes >= 1.0
      ? formattedTime.push(`${minutes}m`)
      : formattedTime.push(`${sm?.toFixed(1)}m`);
    return formattedTime.join(" ");
  };

  useEffect(() => {
    task?.sessions && setTime(getTotalSpentTime(task?.sessions));
    let interval: any = null;
    interval = setInterval(() => {
      setTime((time) => time + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [task?.sessions]);

  return <p>{formatTime(time)}</p>;
}

export default Stopwatch;
