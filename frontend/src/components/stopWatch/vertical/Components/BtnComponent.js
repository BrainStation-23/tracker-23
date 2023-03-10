import React from "react";
import { Button, Tooltip } from "antd";
import { PlayIcon } from "@/icons/playIcon";
import { StopIcon } from "@/icons/stopIcon";
function BtnComponent(props) {
  return (
    <div className="col-span-1">
      {props.status === 0 ? (
        <div className=" bg-indigo-700 rounded-full">
          <Tooltip placement="bottom" title={"Start Session"} color="blue">
            <div
              type="ghost"
              className="border-0 text-white mx-auto w-min py-1"
              onClick={async () => {
                await props.start();
                document.getElementById(`horizontal-start${props.id}`)?.click();
              }}
              disabled={true}
              id={`vertical-start${props.id}`}
            >
              <PlayIcon fill="white" className="h-5 w-5" />
            </div>
          </Tooltip>
        </div>
      ) : (
        ""
      )}

      {props.status === 1 ? (
        <div className=" bg-indigo-700 rounded-full">
          <Tooltip
            placement="bottom"
            title={"Stop Session"}
            color="blue"
            className="mx-auto w-min"
          >
            <div
              className="border-0 text-white mx-auto w-min py-1"
              // type="ghost"
              id={`vertical-stop${props.id}`}
              onClick={async () => {
                await props.stop();
                document.getElementById(`horizontal-stop${props.id}`)?.click();
              }}
              disabled={props.disable}
            >
              <StopIcon fill="white" className="h-5 w-5" />
            </div>
          </Tooltip>
        </div>
      ) : (
        ""
      )}

      {props.status === 2 ? (
        <div className=" bg-indigo-700 rounded-full">
          <Tooltip placement="bottom" title={"Start Session"} color="blue">
            <div
              type="ghost"
              className="border-0 text-white mx-auto w-min py-1"
              onClick={async () => {
                await props.start();
                document
                  .getElementById(`horizontal-resume${props.id}`)
                  ?.click();
              }}
              id={`vertical-resume${props.id}`}
              disabled={props.disable}
            >
              <PlayIcon fill="white" className="h-5 w-5" />
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
