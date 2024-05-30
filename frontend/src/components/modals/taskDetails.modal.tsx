import { userAPI } from "APIs";
import { useState } from "react";
import { message, Modal, Spin } from "antd";
import { AddWorkLogParams, TaskDto } from "models/tasks";

import Sessions from "./components/sessions";
import { localFormat, timeFormat } from "@/components/common/datePicker";
import OpenLinkInNewTab from "@/components/common/link/OpenLinkInNewTab";
import TablePriorityComponent from "@/components/common/tableComponents/tablePriorityComponent";

import {
  getTotalSpentTime,
  getFormattedTotalTime,
} from "@/services/timeActions";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";
import TruncatedText from "@/components/common/truncatedText";

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
  handleDeleteSession,
  handleUpdateSession,
}: Props) => {
  const [spinning, SetSpinning] = useState(false);
  const taskDetails = task;

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const deleteSession = async (sessionId: number) => {
    SetSpinning(true);
    const res = await userAPI.deleteSession(sessionId);
    if (res) {
      message.success(res.message);
      handleDeleteSession(task, sessionId);
    }
    SetSpinning(false);
  };
  const updateSession = async (sessionID: any, values: any) => {
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
      handleUpdateSession(task, res);
      message.success("Session Updated");
      return true;
    } else return false;
  };
  return (
    <Modal
      width={850}
      footer={null}
      zIndex={1100}
      onOk={handleOk}
      open={isModalOpen}
      onCancel={handleCancel}
      title={<div className="text-base font-semibold">Task Details</div>}
    >
      <Spin spinning={spinning}>
        <div className="flex flex-col gap-4">
          <div className="flex w-full items-start gap-2 md:gap-4">
            <span className="min-w-[120px] text-sm font-semibold text-secondary ">
              TItle
            </span>
            <span className="font-medium">
              {taskDetails?.title && (
                <TruncatedText text={taskDetails?.title} truncateAt={80} />
              )}
            </span>
          </div>
          <div className="flex w-full items-start gap-2 md:gap-4">
            <span className="min-w-[120px] text-sm font-semibold text-secondary ">
              Description
            </span>
            <span className="font-medium">
              {taskDetails?.description ? (
                <TruncatedText
                  text={taskDetails.description}
                  truncateAt={150}
                />
              ) : (
                <em>No description provided.</em>
              )}
            </span>
          </div>
          {taskDetails?.url && (
            <div className="flex w-full items-center gap-2 md:gap-4">
              <span className="min-w-[120px] text-sm font-semibold text-secondary ">
                Link
              </span>
              <OpenLinkInNewTab
                onClick={() => {
                  window.open(taskDetails?.url);
                  setIsModalOpen(true);
                }}
              >
                {taskDetails.source}
              </OpenLinkInNewTab>
            </div>
          )}
          <div className="grid grid-cols-2">
            <div className="flex w-full items-center gap-2 md:gap-4">
              <span className="min-w-[120px] text-sm font-semibold text-secondary ">
                Estimation
              </span>
              <span className="font-medium">
                {taskDetails?.estimation ?? <em>No estimation provided.</em>}
                {taskDetails?.estimation && " Hour"}
              </span>
            </div>
            <div className="flex w-full items-center gap-2 md:gap-4">
              <span className="min-w-[120px] text-sm font-semibold text-secondary ">
                Time Left
              </span>
              <span className="font-medium">
                {taskDetails?.estimation
                  ? taskDetails?.estimation * 3600000 -
                      getTotalSpentTime(task.sessions) >
                    0
                    ? getFormattedTotalTime(
                        taskDetails?.estimation * 3600000 -
                          getTotalSpentTime(task.sessions)
                      )
                    : 0
                  : "No estimation"}
              </span>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 md:gap-4">
            <span className="min-w-[120px] text-sm font-semibold text-secondary ">
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
              <div>{taskDetails?.status}</div>
            </div>
          </div>

          {taskDetails?.priority && (
            <div className="flex items-center gap-4">
              <span className="min-w-[120px] text-sm font-semibold text-secondary ">
                Priority
              </span>
              <div className="flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black">
                <TablePriorityComponent task={taskDetails} />
              </div>
            </div>
          )}

          <div className="flex w-full items-center gap-2 md:gap-4">
            <span className="min-w-[120px] text-sm font-semibold text-secondary ">
              Total Spent
            </span>
            <span className="font-medium">
              {getFormattedTotalTime(getTotalSpentTime(task?.sessions))
                ? getFormattedTotalTime(getTotalSpentTime(task?.sessions))
                : "---"}
            </span>
          </div>
          <Sessions
            {...{ taskDetails, deleteSession, updateSession, SetSpinning }}
          />
        </div>
      </Spin>
    </Modal>
  );
};

export default TaskDetailsModal;
