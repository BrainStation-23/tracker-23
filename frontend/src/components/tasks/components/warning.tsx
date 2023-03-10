import {
  Button,
  Form,
  Input,
  RadioChangeEvent,
  Select,
  SelectProps,
} from "antd";
import React, { useState } from "react";

const SessionStartWarning = ({ runningTask, handleWarning }: any) => {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div>{runningTask?.title} is still Running</div>
      <div>Do you want to stop the running task and start this task?</div>
      <div className="flex w-40 justify-between">
        <Button>Yes</Button>
        <Button danger>no</Button>
      </div>
    </div>
  );
};

export default SessionStartWarning;
