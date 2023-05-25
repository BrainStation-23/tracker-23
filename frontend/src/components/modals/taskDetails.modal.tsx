import { message, Modal } from "antd";
import { userAPI } from "APIs";
import { AddWorkLogParams, TaskDto } from "models/tasks";
import { useState } from "react";
import {
  statusBGColorEnum,
  statusBorderColorEnum,
  taskStatusEnum,
} from "utils/constants";

import {
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";

import Sessions from "./components/sessions";
import { localFormat, timeFormat } from "../datePicker";

type Props = {
  task: TaskDto;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  handleDelete?: Function;
  handleDeleteSession: Function;
  handleUpdateSession: Function;
};

const TaskDetailsModal = ({
  task,
  isModalOpen,
  setIsModalOpen,
  handleDelete,
  handleDeleteSession,
  handleUpdateSession,
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
  const deleteSession = async (sessionId: number) => {
    const res = await userAPI.deleteSession(sessionId);
    if (res) {
      message.success(res.message);
      handleDeleteSession(task, sessionId);
    }
  };
  const updateSession = async (sessionID: any, values: any) => {
    console.log(
      "🚀 ~ file: taskDetails.modal.tsx:55 ~ updateSession ~ values:",
      values
    );
    const tmp: AddWorkLogParams = {
      startTime: new Date(
        `${localFormat(values.date)} ${timeFormat(values.time[0])}`
      ),
      endTime: new Date(
        `${localFormat(values.date)} ${timeFormat(values.time[1])}`
      ),
      taskId: taskDetails.id,
    };
    const res = await userAPI.updateSession(sessionID, tmp);
    if (res) {
      console.log("🚀 ~ file: sessions.tsx:44 ~ onFinish ~ res:", res);
      handleUpdateSession(task, res);
      message.success("Session Updated");
      return true;
    } else return false;
  };
  return (
    <>
      <Modal
        title={<div className=" text-base font-semibold "> Task Details</div>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={850}
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
                backgroundColor:
                  statusBGColorEnum[taskDetails?.statusCategoryName],
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
                  backgroundColor:
                    statusBorderColorEnum[taskDetails?.statusCategoryName],
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
          <Sessions {...{ taskDetails, deleteSession, updateSession }} />
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailsModal;
