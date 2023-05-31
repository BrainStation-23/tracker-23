import { getTotalSpentTime } from "@/services/timeActions";
import { Tooltip } from "antd";
import React from "react";

function TimeDisplayComponent(props: any) {
  let value = 0;
  const { totalTime } = props;
  const totalSpentTime = Math.round(totalTime / 1000);
  value = totalSpentTime;
  let tmp = totalSpentTime;
  const s = tmp % 60;
  const tm = tmp === 0 ? 0 : (tmp / 60).toFixed(1);
  tmp = Math.floor(tmp / 60);
  const m = tmp % 60;
  tmp = Math.floor(tmp / 60);
  const h = tmp;
  return (
    <div className="flex w-max">
      {h > 0 ? h + "hrs " : ""}
      {m === 0 && h === 0 ? tm + "m" : h > 0 && m === 0 ? "" : m + "m"}
    </div>
  );
}

export default TimeDisplayComponent;
