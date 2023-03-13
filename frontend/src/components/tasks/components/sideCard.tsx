import { Divider, Spin } from "antd";
import { useEffect, useState } from "react";

import ReactStopWatchCopy from "@/components/stopWatch/horizontal/reactStopWatchCopy";
import Sessions from "@/components/modals/components/sessions";
import { TaskDto } from "models/tasks";

type Props = {
  task: TaskDto;
};
const SideCard = ({ task }: Props) => {
  const taskName = task ? task.title : "Task 1";
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<TaskDto>();
  const addSession = (session: any) => {
    if (!task.sessions) task.sessions = [];
    task.sessions?.push(session);
  };
  const addEndTime = (session: any) => {
    task.sessions = task.sessions?.map((_session: any) => {
      if (_session.id === session.id) return session;
      else return _session;
    });
  };
  useEffect(() => {
    if (newTask !== task) setNewTask(task);
  }, [task, newTask]);
  return (
    <div className="" style={{ maxHeight: "calc(100vh - 155px)" }}>
      <Spin spinning={newTask !== task}></Spin>
      {newTask === task && (
        <div
          className="mb-2 flex w-full max-w-xl flex-col items-center gap-0 rounded-lg  px-2  py-5"
          // style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          <span className="w-full text-left text-xl font-bold">
            Time Tracking
          </span>
          <div
            className="mx-auto w-max pt-2 text-xs font-medium text-gray-400 hover:cursor-pointer"
            onClick={() => setViewModalOpen(true)}
          >
            {taskName}
          </div>
          {/* <div
            className={`text-sm text-center font-medium col-span-2 `}
            style={{
              color: statusColorEnum[task.status],
            }}
          >
            {typeof task?.status === "string" && taskStatusEnum[task.status]}
          </div> */}
          <div>{newTask === task && <ReactStopWatchCopy task={newTask} />}</div>
          <Divider className="my-2 p-0" />
          <Sessions taskDetails={task} />
        </div>
      )}
    </div>
  );
};

export default SideCard;
