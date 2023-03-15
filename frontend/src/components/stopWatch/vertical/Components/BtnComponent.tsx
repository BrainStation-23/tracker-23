import React from "react";
import { Button, Tooltip } from "antd";
import { PlayIcon } from "@/icons/playIcon";
import { StopIcon } from "@/icons/stopIcon";
function BtnComponent(props: any) {
  return (
    <div className="col-span-1">
      {props.status === 0 ? (
        <div className=" rounded-full bg-indigo-700">
          <Tooltip placement="bottom" title={"Start Session"} color="blue">
            <div
              className="mx-auto w-min border-0 py-1 text-white"
              onClick={async () => {
                await props.start();
                document.getElementById(`horizontal-start${props.id}`)?.click();
              }}
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
        <div className=" rounded-full bg-indigo-700">
          <Tooltip
            placement="bottom"
            title={"Stop Session"}
            color="blue"
            className="mx-auto w-min"
          >
            <div
              className="mx-auto w-min border-0 py-1 text-white"
              id={`vertical-stop${props.id}`}
              onClick={async () => {
                await props.stop();
                document.getElementById(`horizontal-stop${props.id}`)?.click();
              }}
            >
              <StopIcon fill="white" className="h-5 w-5" />
            </div>
          </Tooltip>
        </div>
      ) : (
        ""
      )}

      {props.status === 2 ? (
        <div className=" rounded-full bg-indigo-700">
          <Tooltip placement="bottom" title={"Start Session"} color="blue">
            <div
              className="mx-auto w-min border-0 py-1 text-white"
              onClick={async () => {
                await props.start();
                document
                  .getElementById(`horizontal-resume${props.id}`)
                  ?.click();
              }}
              id={`vertical-resume${props.id}`}
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
