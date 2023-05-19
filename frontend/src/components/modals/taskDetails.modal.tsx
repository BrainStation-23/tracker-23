import { updateTask } from "@/services/taskActions";
import {
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Input, Modal } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
import {
  statusBGColorEnum,
  statusBorderColorEnum,
  taskStatusEnum,
} from "utils/constants";
import Sessions from "./components/sessions";

type Props = {
  task: TaskDto;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  handleDelete?: Function;
};

const TaskDetailsModal = ({
  task,
  isModalOpen,
  setIsModalOpen,
  handleDelete,
}: Props) => {
  const [editing, SetEditing] = useState(true);
  const [currentTaskName, setCurrentTaskName] = useState(task?.title);
  const [currentSession, setCurrentSession] = useState(null);
  const taskDetails = task;

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title={<div className=" text-base font-semibold "> Task Details</div>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={720}
      >
        <div className="flex flex-col gap-4">
          <div className="flex w-full items-center gap-4">
            <span className="w-[120px] text-sm font-semibold text-[#4D4E55] ">
              TItle
            </span>
            <span className="font-medium">{task?.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-[120px] text-sm font-semibold text-[#4D4E55] ">
              Description
            </span>{" "}
            <span className="font-medium">
              {taskDetails?.description ?? <em>No description provided.</em>}
            </span>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex items-center gap-4">
              <span className="w-[120px] text-sm font-semibold text-[#4D4E55] ">
                Estimation
              </span>{" "}
              <span className="font-medium">
                {taskDetails?.estimation ?? <em>No estimation provided.</em>}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-[120px] text-sm font-semibold text-[#4D4E55] ">
                Time Left
              </span>
              <span className="font-medium">
                {taskDetails?.estimation
                  ? getFormattedTotalTime(
                      taskDetails?.estimation * 3600000 -
                        getTotalSpentTime(task.sessions)
                    )
                  : "No estimation"}{" "}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-[120px] text-sm font-semibold text-[#4D4E55] ">
              Status
            </span>
            <div
              style={{
                backgroundColor: statusBGColorEnum[taskDetails?.statusCategoryName],
                border: `1px solid ${
                  statusBorderColorEnum[taskDetails?.statusCategoryName]
                }`,
                borderRadius: "36px",
              }}
              className="flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: statusBorderColorEnum[taskDetails?.statusCategoryName],
                }}
              />

              <div>{taskStatusEnum[taskDetails?.statusCategoryName]}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-[120px] text-sm font-semibold text-[#4D4E55] ">
              Total Spent{" "}
            </span>
            <span className="font-medium">
              {getFormattedTotalTime(getTotalSpentTime(task?.sessions))
                ? getFormattedTotalTime(getTotalSpentTime(task?.sessions))
                : "---"}
            </span>
          </div>
          <Sessions {...{ taskDetails }} />
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailsModal;
