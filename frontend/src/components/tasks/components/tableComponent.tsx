import {
  Button,
  Table,
  TablePaginationConfig,
  Tooltip,
  Typography,
} from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { TableParams, TaskDto } from "models/tasks";
import { useState } from "react";

import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import { integrationIcons } from "@/components/integrations/components/importCard";
import Stopwatch from "@/components/stopWatch/tabular/timerComponent";
import { checkIfRunningTask, startTimeSorter } from "@/services/taskActions";
import {
  formatDate,
  getFormattedTime,
  getTotalSpentTime,
} from "@/services/timeActions";

import MoreFunctionComponent from "./moreFunction";
import TimeDisplayComponent from "./timeDisplayComponent";
import PinFilledIconSvg from "@/assets/svg/PinFilledIconSvg";
import PinIconSvg from "@/assets/svg/PinIconSvg";

const { Text } = Typography;
const TableComponent = ({
  tasks,
  runningTask,
  setSelectedTask,
  setTaskViewModalOpen,
  deleteTask,
  startSession,
  stopSession,
  setManualTimeEntryModalOpen,
  sessionActionLoading,
  handlePinTask,
}: any) => {
  const columns: any = [
    {
      title: "Task Name",
      dataIndex: "title",
      key: "title",
      render: (_: any, task: TaskDto) => {
        return (
          <div className="flex items-center gap-2" aria-disabled="true">
            {task.pinned && (
              <Tooltip title={`Click To ${task.pinned ? "unpin" : "pin"}`}>
                <Button
                  className="absolute top-0 left-0 flex gap-3 p-1"
                  onClick={() => {
                    handlePin(task);
                  }}
                  type="ghost"
                >
                  {task.pinned ? <PinFilledIconSvg /> : <PinIconSvg />}
                </Button>
              </Tooltip>
            )}
            {task.source !== "OUTLOOK" ? (
              <div className="cursor-pointer">
                {runningTask?.id != task.id ? (
                  <Tooltip title="Click To Start Task">
                    <div
                      onClick={() => {
                        !sessionActionLoading && startSession(task);
                      }}
                    >
                      <PlayIconSvg />
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip title="Click To Stop Task">
                    <div
                      onClick={() => {
                        !sessionActionLoading && stopSession(task);
                      }}
                    >
                      <PauseIconSvg />
                    </div>
                  </Tooltip>
                )}
              </div>
            ) : (
              <div className="h-1 p-4"></div>
            )}
            <div className="flex flex-col gap-2">
              <Text
                className="w-[180px] cursor-pointer"
                ellipsis={{ tooltip: task?.title }}
                onClick={() => {
                  setSelectedTask(task);
                  setTaskViewModalOpen(true);
                }}
              >
                {task?.title}
              </Text>
              <div className="flex cursor-pointer gap-2">
                {task.projectName && (
                  <div
                    className="w-max bg-[#4D4E55] px-2 py-0.5 text-xs font-medium"
                    style={{
                      background: "#ECECED",
                      borderRadius: "4px",
                    }}
                  >
                    {task.projectName}
                  </div>
                )}
                {integrationIcons[task.source]}
              </div>
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => {
        if (a.title === b.title) {
          return 0;
        }

        if (a.title > b.title) {
          return 1;
        }

        return -1;
      },
    },
    {
      title: "Source",
      dataIndex: "dataSource",
      key: "dataSource",
      // align: "center",
      render: (dataSource: any, task: TaskDto) => (
        <div className="flex max-w-[150px] items-center gap-2 ">
          <div>{integrationIcons[task.source]} </div>
          <Text
            className="w-min cursor-pointer"
            ellipsis={{ tooltip: dataSource }}
          >
            {dataSource}
          </Text>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => {
        return <>{getFormattedTime(formatDate(createdAt))}</>;
      },

      sorter: (a: any, b: any) => {
        const aCreated = new Date(a.created);
        const bCreated = new Date(b.created);
        if (aCreated === bCreated) {
          return 0;
        }

        if (aCreated > bCreated) {
          return 1;
        }

        return -1;
      },
    },
    {
      title: "Started",
      dataIndex: "started",
      key: "started",
      align: "center",
      render: (_: any, task: TaskDto) => (
        <>
          {task.sessions?.length > 0
            ? getFormattedTime(formatDate(task.sessions[0].startTime))
            : "Not Started"}
        </>
      ),
      sorter: (a: TaskDto, b: TaskDto) => {
        return startTimeSorter(a, b);
      },
    },
    {
      title: "Ended",
      dataIndex: "ended",
      key: "ended",
      render: (ended: any, task: TaskDto) => (
        <>
          {task.sessions?.length > 0 && !checkIfRunningTask(task.sessions)
            ? getFormattedTime(
                formatDate(task.sessions[task.sessions?.length - 1]?.endTime)
              )
            : task.sessions[0]
            ? "Running"
            : "Not Started"}
        </>
      ),
      align: "center",
    },
    {
      title: "Total Spent",
      dataIndex: "total",
      key: "total",
      align: "center",
      render: (_: any, task: TaskDto) =>
        runningTask?.id !== task.id ? (
          <TimeDisplayComponent totalTime={getTotalSpentTime(task.sessions)} />
        ) : (
          <Stopwatch
            milliseconds={getTotalSpentTime(task.sessions)}
            task={task}
          />
        ),
      sorter: (a: any, b: any) =>
        getTotalSpentTime(a.sessions) - getTotalSpentTime(b.sessions),
    },
    {
      title: "",
      dataIndex: "",
      key: "",
      width: 70,
      render: (_: any, task: TaskDto) => (
        <div className="flex justify-end gap-2">
          <MoreFunctionComponent
            {...{ task, deleteTask, handlePin, handleAddManualWorkLog }}
          />
        </div>
      ),
    },
  ];
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showLessItems: true,
      position: ["bottomRight", "bottomLeft"],
    },
  });
  const handleAddManualWorkLog = (task: TaskDto) => {
    setManualTimeEntryModalOpen(true);
    setSelectedTask(task);
  };
  const handlePin = async (task: TaskDto) => {
    const res = handlePinTask(task);
    if (res)
      task.pinned
        ? (tableParams.pagination.total = tableParams.pagination.total - 1)
        : (tableParams.pagination.total = tableParams.pagination.total + 1);
  };

  const getRowClassName = (task: TaskDto) => {
    if (!task.sessions) task.sessions = [];
    return runningTask?.id === task.id ? "bg-[#F3FCFF]" : "";
  };
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<TaskDto> | SorterResult<TaskDto>[]
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };
  return (
    <Table
      columns={columns}
      dataSource={tasks}
      rowKey={(task) => task.id}
      pagination={tableParams.pagination}
      rowClassName={getRowClassName}
      onChange={handleTableChange}
    />
  );
};

export default TableComponent;
