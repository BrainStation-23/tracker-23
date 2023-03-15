import {
  Button,
  Form,
  Input,
  RadioChangeEvent,
  Select,
  SelectProps,
} from "antd";
import React, { useState } from "react";

const SessionStartWarning = ({
  runningTask,
  handleWarningClick,
  warningData,
}: any) => {
  console.log("🚀 ~ file: warning.tsx:16 ~ warningData:", warningData);
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div>
        <span className="font-bold">{runningTask?.title}</span> is still Running
      </div>
      <div>
        Do you want to stop{" "}
        <span className="font-bold">{runningTask?.title}</span> and start{" "}
        <span className="font-bold">{warningData[0]?.title}</span>?
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
