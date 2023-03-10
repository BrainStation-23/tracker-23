import { Button, Tooltip } from "antd";

import { PlayIcon } from "@/icons/playIcon";
import React from "react";
import { StopIcon } from "@/icons/stopIcon";

function BtnComponent(props) {
  return (
    <div className="col-span-1 hover:cursor-pointer">
      {props.status === 0 ? (
        <div
          className=" rounded-full bg-indigo-700 p-3 transition-all duration-1000 hover:bg-indigo-800"
          onClick={() => {
            document.getElementById(`vertical-start${props.id}`)?.click();
            document.getElementById(`vertical-resume${props.id}`)?.click();
            props.start();
          }}
          id={`horizontal-start${props.id}`}
        >
          <Tooltip placement="bottom" title={"Start Session"} color="blue">
            <div type="ghost" className="mx-auto w-min border-0 text-white">
              <PlayIcon fill="white" className="h-6 w-6" />
            </div>
          </Tooltip>
        </div>
      ) : (
        ""
      )}

      {props.status === 1 ? (
        <div
          className=" rounded-full bg-indigo-700 p-3 hover:bg-indigo-800"
          id={`horizontal-stop${props.id}`}
          onClick={() => {
            document.getElementById(`vertical-stop${props.id}`)?.click();

            props.stop();
          }}
        >
          <Tooltip
            placement="bottom"
            title={"Stop Session"}
            color="blue"
            className="mx-auto w-min"
          >
            <div
              className="mx-auto w-min border-0 text-white"
              // type="ghost"
            >
              <StopIcon fill="white" className="h-6 w-6" />
            </div>
          </Tooltip>
        </div>
      ) : (
        ""
      )}

      {props.status === 2 ? (
        <div
          className=" rounded-full bg-indigo-700 p-3 hover:bg-indigo-800 "
          id={`horizontal-resume${props.id}`}
          onClick={() => {
            document.getElementById(`vertical-start${props.id}`)?.click();
            document.getElementById(`vertical-resume${props.id}`)?.click();
            props.start();
          }}
        >
          <Tooltip placement="bottom" title={"Start Session"} color="blue">
            <div type="ghost" className="mx-auto w-min border-0 text-white">
              <PlayIcon fill="white" className="h-6 w-6" />
            </div>
          </Tooltip>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default BtnComponent;
