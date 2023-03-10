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
import Sessions from "./components/sessions";

type Props = {
  task: TaskDto;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  handleDelete: Function;
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
            <span className="w-20 text-right font-medium">Task Name:</span>
            <div className="flex-1">
              {editing && false ? (
                <Input
                  size="small"
                  value={currentTaskName}
                  onChange={(e) => setCurrentTaskName(e.target.value)}
                />
              ) : (
                <div className="text-lg font-medium">{currentTaskName}</div>
              )}
            </div>
            {/* {editing ? (
              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => {
                    if (taskDetails) taskDetails.title = currentTaskName;
                    updateTask(task, taskDetails.title);
                    SetEditing(false);
                  }}
                >
                  Save
                </Button>
                <Button onClick={() => SetEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button icon={<EditOutlined />} onClick={() => SetEditing(true)}>
                Edit
              </Button>
            )} */}
            {editing && (
              <Button
                danger
                onClick={() => {
                  handleDelete();
                  setIsModalOpen(false);
                }}
              >
                Delete
              </Button>
            )}
          </div>
          <div>
            <span className="font-medium">Description:</span>{" "}
            {taskDetails?.description ?? <em>No description provided.</em>}
          </div>
          <div>
            <span className="font-medium">Estimation:</span>{" "}
            {taskDetails?.estimation ?? <em>No estimation provided.</em>}
          </div>
          <div>
            Time Left :{" "}
            {taskDetails?.estimation
              ? getFormattedTotalTime(
                  taskDetails?.estimation * 3600000 -
                    getTotalSpentTime(task.sessions)
                )
              : "No estimation"}{" "}
          </div>

          <div>Status : {taskDetails?.status ? taskDetails?.status : ""}</div>

          <div>
            Total Spent :{" "}
            {getFormattedTotalTime(getTotalSpentTime(task.sessions))} seconds{" "}
          </div>
          <Sessions {...{ taskDetails }} />
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailsModal;
