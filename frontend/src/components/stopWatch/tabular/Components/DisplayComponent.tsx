import { Tooltip } from "antd";
import React from "react";

function DisplayComponent(props: any) {
  const h = () => {
    if (props.time.h === 0) {
      return "";
    } else {
      return (
        <span>{props.time.h >= 10 ? props.time.h : "0" + props.time.h}</span>
      );
    }
  };
  // console.log(props.sessionTime);
  return (
    <div className=" col-span-5 m-auto text-center font-semibold">
      <Tooltip placement="bottom" title={"Total Spent Time"} color="blue">
        {props.sessionTime.h > 0 && (
          <span>
            {props.sessionTime.h >= 10
              ? props.sessionTime.h
              : props.sessionTime.h}
            hrs{" "}
          </span>
        )}
        {/* &nbsp;:&nbsp; */}
        {props.sessionTime.m + props.sessionTime.h > 0 && (
          <span>
            {props.sessionTime.m >= 10
              ? props.sessionTime.m
              : props.sessionTime.m}
            m
          </span>
        )}
        &nbsp;:&nbsp;
        <span>
          {props.sessionTime.s >= 10
            ? props.sessionTime.s
            : props.sessionTime.s}
          s
        </span>
      </Tooltip>
      {/* &nbsp;:&nbsp;
      <span>{props.time.ms >= 10 ? props.time.ms : "0" + props.time.ms}</span> */}
      {/* <Tooltip placement="bottom" title={"Total Spent Time"} color="blue">
        <span className="font-bold">
          ({props.time.h + +(props.time.m / 60).toFixed(2)} h)
        </span>
      </Tooltip> */}
      {/* &nbsp;:&nbsp;
      <span>{props.sessionTime.ms >= 10 ? props.sessionTime.ms : "0" + props.sessionTime.ms}</span> */}
    </div>
  );
}

export default DisplayComponent;
