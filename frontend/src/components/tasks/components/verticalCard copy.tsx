import { Card } from "antd";
import { useState } from "react";
import Stopwatch from "../../stopWatch/vertical/reactStopWatch";
import TaskDetailsModal from "../../modals/taskDetails.modal";
import { getLocalStorage } from "@/storage/storage";
import { TaskDto } from "../../../../models/tasks/index";
import { statusColorEnum, taskStatusEnum } from "utils/constants";

type Props = {
  task: TaskDto;
  deleteTask: Function;
  setSelectedTask: Function;
};

const VerticalCard = ({ task, deleteTask, setSelectedTask }: Props) => {
  const taskName = task ? task.title : "Task 1";
  const [viewModalOpen, setViewModalOpen] = useState(false);
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
  const handleDelete = async () => {
    await deleteTask(task.id);
  };
  return (
    <>
      <Card
        className="w-full mb-2 px-2 border rounded-lg"
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex justify-between w-full items-center">
          <div
            className="hover:text-blue-500  hover:cursor-pointer text-lg font-medium"
            onClick={() => setViewModalOpen(true)}
          >
            {taskName}
          </div>
          <div>
            <div className="grid grid-cols-5 gap-1 w-72 items-center ">
              <div
                className={`text-sm text-center font-medium col-span-2 `}
                style={{
                  color: statusColorEnum[task.status],
                }}
              >
                {typeof task?.status === "string" &&
                  taskStatusEnum[task.status]}
              </div>
              <Stopwatch
                task={task}
                addSession={addSession}
                addEndTime={addEndTime}
              />
            </div>
          </div>
        </div>
      </Card>
      <TaskDetailsModal
        task={task}
        isModalOpen={viewModalOpen}
        setIsModalOpen={setViewModalOpen}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default VerticalCard;
