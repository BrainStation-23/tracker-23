import { TaskDto } from "models/tasks";
import React, { useEffect, useState } from "react";

import { getTotalSpentTime } from "@/services/timeActions";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  milliseconds: number;
  task?: TaskDto;
};
function Stopwatch({ milliseconds, task }: Props) {
  const [time, setTime] = useState(milliseconds);
  const timeFormat = useAppSelector(
    (state: RootState) => state.settingsSlice.timeFormat
  );
  useEffect(() => {
    task?.sessions && setTime(getTotalSpentTime(task?.sessions));
    let interval: any = null;
    interval = setInterval(() => {
      setTime((time) => time + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [task?.sessions]);

  const formatTime = (time: number) => {
    let tmp = Math.floor(time / 1000);
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let sm: any = 0;

    if (timeFormat === "Day") {
      days = Math.floor(tmp / (8 * 3600));
      tmp %= 8 * 3600;
      hours = Math.floor(tmp / 3600);
      tmp %= 3600;
      sm = (tmp / 60).toFixed(1);
      minutes = Math.floor(tmp / 60);
    } else if (timeFormat === "Hour") {
      hours = Math.floor(tmp / 3600);
      tmp %= 3600;
      minutes = Math.floor(tmp / 60);
      sm = tmp / 60;
    }

    const formattedTime = [];
    days > 0 && formattedTime.push(days + "d");
    hours > 0 && formattedTime.push(hours + "h");
    minutes >= 1.0
      ? formattedTime.push(`${minutes}m`)
      : formattedTime.push(`${sm?.toFixed(1)}m`);
    return formattedTime.join(" ");
  };

  return (
    <div>
      <p>{formatTime(time)}</p>
    </div>
  );
}

export default Stopwatch;
