import React from "react";

import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

function TimeDisplayComponent(props: any) {
  const { totalTime } = props;
  const timeFormat = useAppSelector(
    (state: RootState) => state.settingsSlice.timeFormat
  );
  const totalSpentTime = Math.round(totalTime / 1000);
  let tmp = totalSpentTime;

  let days = 0;
  let hours = 0;
  let minutes = 0;

  if (timeFormat === "Day") {
    days = Math.floor(tmp / (8 * 3600));
    tmp %= 8 * 3600;
    hours = Math.floor(tmp / 3600);
    tmp %= 3600;
    minutes = Math.round(tmp / 60);
  } else if (timeFormat === "Hour") {
    hours = Math.floor(tmp / 3600);
    tmp %= 3600;
    minutes = Math.round(tmp / 60);
  } else {
    // Default to hour format if timeFormat is not specified or invalid
    hours = Math.floor(tmp / 3600);
    tmp %= 3600;
    minutes = Math.round(tmp / 60);
  }
  const formattedParts = [];
  days > 0 && formattedParts.push(`${days}d`);
  hours > 0 && formattedParts.push(`${hours}h`);
  minutes === 0 && hours === 0 && days === 0
    ? formattedParts.push(`${minutes}m`)
    : hours > 0 && minutes === 0
    ? ""
    : formattedParts.push(`${minutes}m`);

  return <div className="mx-auto flex w-max">{formattedParts.join(" ")}</div>;
}

export default TimeDisplayComponent;
