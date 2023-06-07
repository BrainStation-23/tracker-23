import { getTotalSpentTime } from "@/services/timeActions";
import { TaskDto } from "models/tasks";
import React, { useState, useEffect } from "react";
type Props = {
  milliseconds: number;
  task?: TaskDto;
};
function Stopwatch({ milliseconds, task }: Props) {
  const [time, setTime] = useState(milliseconds);

  useEffect(() => {
    task?.sessions && setTime(getTotalSpentTime(task?.sessions));
    let interval: any = null;
    interval = setInterval(() => {
      setTime((time) => time + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [task?.sessions]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600000).toString();
    const h = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000).toString();
    const sm = ((time % 3600000) / 60000).toFixed(1);

    // .padStart(2, "0");
    const seconds = Math.floor((time % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${h > 0 ? hours + "hrs " : ""} ${
      (time % 3600000) / 60000 < 1 && h === 0 ? sm : minutes
    }m`;
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      <p>{formatTime(time)}</p>
    </div>
  );
}

export default Stopwatch;
