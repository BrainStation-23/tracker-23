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
        title="Task Details"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={720}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">TItle :</span>
            <div className="flex-1">{task?.title}</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Description:</span>{" "}
            {taskDetails?.description ?? <em>No description provided.</em>}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Estimation:</span>{" "}
            {taskDetails?.estimation ?? <em>No estimation provided.</em>}
          </div>
          <div className="flex items-center gap-4">
            Time Left :{" "}
            {taskDetails?.estimation
              ? getFormattedTotalTime(
                  taskDetails?.estimation * 3600000 -
                    getTotalSpentTime(task.sessions)
                )
              : "No estimation"}{" "}
          </div>

          <div className="flex items-center gap-4">
            Status :{" "}
            <div
              style={{
                backgroundColor: statusBGColorEnum[taskDetails?.status],
                border: `1px solid ${
                  statusBorderColorEnum[taskDetails?.status]
                }`,
                borderRadius: "36px",
              }}
              className="flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: statusBorderColorEnum[taskDetails?.status],
                }}
              />

              <div>{taskStatusEnum[taskDetails?.status]}</div>
            </div>
          </div>

          <div>
            Total Spent :{" "}
            {getFormattedTotalTime(getTotalSpentTime(task?.sessions))}
          </div>
          <Sessions {...{ taskDetails }} />
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailsModal;
