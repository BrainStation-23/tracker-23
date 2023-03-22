import { Button } from "antd";
import { TaskDto } from "models/tasks";
import React, { useState } from "react";
type Props = {
  runningTask: TaskDto;
  handleWarningClick: Function;
  warningData: TaskDto;
};

const SessionStartWarning = ({
  runningTask,
  handleWarningClick,
  warningData,
}: Props) => {
  console.log("🚀 ~ file: warning.tsx:16 ~ warningData:", warningData);
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div>
        <span className="font-bold">{runningTask?.title}</span> is still Running
      </div>
      <div>
        Do you want to stop{" "}
        <span className="font-bold">{runningTask?.title}</span> and start{" "}
        <span className="font-bold">{warningData?.title}</span>?
      </div>
      <div className="flex w-40 justify-between">
        <Button onClick={() => handleWarningClick(true)}>Yes</Button>
        <Button danger onClick={() => handleWarningClick(false)}>
          no
        </Button>
      </div>
    </div>
  );
};

export default SessionStartWarning;
