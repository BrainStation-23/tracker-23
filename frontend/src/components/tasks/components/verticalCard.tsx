import Stopwatch from "../../stopWatch/vertical/reactStopWatch";
import TaskDetailsModal from "../../modals/taskDetails.modal";
import { TaskDto } from "../../../../models/tasks/index";
import { Tooltip } from "antd";
import { getTotalSpentTime } from "@/services/timeActions";
import { statusColorEnum, taskStatusEnum } from "utils/constants";
import { useContext, useState } from "react";
import { TaskContext } from "@/components/tasks";

type Props = {
  task: TaskDto;
  deleteTask: Function;
  setSelectedTask: Function;
  selectedTask: TaskDto;
};

const VerticalCard = ({
  task,
  deleteTask,
  setSelectedTask,
  selectedTask,
}: Props) => {
  const [completed, setCompleted] = useState(false);
  const taskName = task ? task.title : "Task 1";
  const { runningTask } = useContext(TaskContext);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const addSession = (session: any) => {
    if (!task.sessions) task.sessions = [];
    task.sessions?.push(session);
    setSelectedTask({ ...task });
  };
  const addEndTime = (session: any) => {
    task.sessions = task.sessions?.map((_session: any) => {
      if (_session.id === session.id) return session;
      else return _session;
    });
    runningTask?.id === task.id && setSelectedTask({ ...task });
  };
  const handleDelete = async () => {
    await deleteTask(task.id);
  };
  const spentPercentage = Math.round(
    getTotalSpentTime(task.sessions) / (task?.estimation * 36000)
  );

  return (
    <>
      <div
        className={`disable h-min w-full rounded border p-2 hover:cursor-pointer ${
          task.id !== selectedTask?.id ? "hover:bg-gray-100" : "bg-gray-200"
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex w-full items-center justify-between gap-1">
          <div className="flex max-w-[300px] flex-col gap-2 text-left text-lg font-medium">
            <div
              className="hover:cursor-pointer hover:text-blue-500"
              onClick={() => setViewModalOpen(true)}
            >
              Title: {taskName}
            </div>
            {/* <div onClick={() => setCompleted(!completed)}>
              {completed ? (
                <BsCircle className="text-gray-300" />
              ) : (
                <BsCheck2Circle className="text-blue-700" />
              )}{" "}
            </div> */}
            <div className="text-sm font-normal">
              Description: {task.description}
            </div>
          </div>
          {/* <div className="w-32 h-1 bg-gray-200">
            <div
              className=" h-1 "
              style={{
                width: `${Math.round(
                  getTotalSpentTime(task.sessions) /
                    (task?.estimation * 3600000)
                )}%`,
                backgroundColor: statusColorEnum[task.status],
              }}
            />
          </div> */}
          <div className="grid w-72 grid-cols-6 items-center gap-1">
            <div className="col-span-2 flex flex-col gap-2">
              <div className="mx-auto w-min text-xs">Progress:</div>
              <Tooltip
                placement="bottom"
                title={`${
                  task?.estimation
                    ? `${spentPercentage}% Spent`
                    : "No Estimation"
                }`}
                color={`${spentPercentage > 100 ? "red" : "blue"}  `}
              >
                <div className=" flex h-full items-center ">
                  {" "}
                  {spentPercentage <= 100 ? (
                    <div
                      className={`col-span-2 h-1.5 w-24 rounded-lg ${
                        task.id === selectedTask?.id
                          ? "bg-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <div
                        className=" h-1.5 rounded-lg "
                        style={{
                          width: `${spentPercentage}%`,
                          backgroundColor: statusColorEnum[task.status],
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`col-span-2 h-1.5 w-24 rounded-lg ${
                        task.id === selectedTask?.id
                          ? "bg-red-500"
                          : "bg-red-500"
                      }`}
                    />
                  )}
                </div>
              </Tooltip>
              <div
                className={`col-span-2 text-center text-sm font-medium `}
                style={{
                  color: statusColorEnum[task.status],
                }}
              >
                <div className="mx-auto w-min text-xs">Status:</div>
                {typeof task?.status === "string" &&
                  taskStatusEnum[task.status]}
              </div>
            </div>
            <Stopwatch
              task={task}
              disable={task.id !== selectedTask?.id}
              addSession={addSession}
              addEndTime={addEndTime}
            />
          </div>
        </div>
      </div>
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
