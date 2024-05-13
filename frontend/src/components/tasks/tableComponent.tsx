import Link from "next/link";
import { useState } from "react";
import {
  Table,
  Button,
  Tooltip,
  Typography,
  TablePaginationConfig,
} from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";

// Model
import { TableParams, TaskDto } from "models/tasks";

// Assets
import PinIconSvg from "@/assets/svg/PinIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PinFilledIconSvg from "@/assets/svg/PinFilledIconSvg";

// Services
import {
  formatDate,
  getFormattedTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { urlToKeyword } from "@/services/helpers";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";
import { checkIfRunningTask, startTimeSorter } from "@/services/taskActions";

// Components
import MoreFunctionComponent from "./moreFunction";
import StatusDropdownComponent from "./statusDropdown";
import EstimationComponent from "./estimationComponent";
import TimeDisplayComponent from "./timeDisplayComponent";
import Stopwatch from "@/components/stopWatch/tabular/timerComponent";
import { integrationIcons } from "@/components/integrations/components/importCard";
import { useMediaQuery } from "react-responsive";

const { Text } = Typography;

type Props = {
  tasks: TaskDto[];
  deleteTask: Function;
  setLoading: Function;
  stopSession: Function;
  runningTask: TaskDto;
  startSession: Function;
  handlePinTask: Function;
  setSelectedTask: Function;
  handleStatusChange: Function;
  sessionActionLoading: boolean;
  setTaskViewModalOpen: Function;
  handleEstimationChange: Function;
  setManualTimeEntryModalOpen: Function;
};

const TableComponent = ({
  tasks,
  deleteTask,
  setLoading,
  stopSession,
  runningTask,
  startSession,
  handlePinTask,
  setSelectedTask,
  handleStatusChange,
  sessionActionLoading,
  setTaskViewModalOpen,
  handleEstimationChange,
  setManualTimeEntryModalOpen,
}: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const totalEstimation = tasks.reduce((acc, curr) => acc + curr.estimation, 0);
  const totalSpent =
    tasks.reduce((acc, curr) => acc + curr?.totalSpent, 0) / 1000;
  let tmp = totalSpent;
  const hours = Math.floor(tmp / 3600);
  tmp %= 3600;
  const minutes = Math.round(tmp / 60);

  const columns: any = [
    {
      key: "title",
      fixed: "left",
      title: "Task Name",
      dataIndex: "title",
      width: isMobile ? 100 : 240,
      render: (_: any, task: TaskDto) => {
        return (
          <div
            aria-disabled="true"
            onClick={() => {
              setSelectedTask(task);
              setTaskViewModalOpen(true);
            }}
            className="flex w-full items-center gap-2"
          >
            {task.pinned && (
              <Tooltip title={`Click To ${task.pinned ? "unpin" : "pin"}`}>
                <Button
                  onClick={() => handlePin(task)}
                  className="absolute left-0 top-0 flex gap-3 p-1"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        !sessionActionLoading && startSession(task);
                      }}
                    >
                      <PlayIconSvg />
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip title="Click To Stop Task">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        !sessionActionLoading && stopSession(task);
                      }}
                    >
                      <PauseIconSvg />
                    </div>
                  </Tooltip>
                )}
              </div>
            ) : (
              <div className="h-1 p-4" />
            )}
            <div className="flex flex-col gap-2">
              <Text
                className="w-28 cursor-pointer md:w-60"
                ellipsis={{ tooltip: task?.title }}
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
      key: "status",
      title: "Status",
      align: "center",
      dataIndex: "status",
      render: (_: any, task: TaskDto) => (
        <StatusDropdownComponent
          task={task}
          setLoading={setLoading}
          handleStatusChange={handleStatusChange}
          isDisabled={runningTask?.id === task.id}
          selectedStatus={{
            name: task.status,
            statusCategoryName: task.statusCategoryName,
          }}
        >
          <div
            style={{
              backgroundColor: statusBGColorEnum[task.statusCategoryName],
              border: `1px solid ${
                statusBorderColorEnum[task.statusCategoryName]
              }`,
              borderRadius: "36px",
            }}
            className="relative flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: statusBorderColorEnum[task.statusCategoryName],
              }}
            />
            <div className="max-w-[90px]">
              <Text ellipsis={{ tooltip: task?.status }}>{task.status}</Text>
            </div>
          </div>
        </StatusDropdownComponent>
      ),
    },
    {
      title: "Source",
      align: "center",
      key: "dataSource",
      dataIndex: "dataSource",
      render: (dataSource: string, task: TaskDto) => (
        <div className="flex max-w-[150px] items-center gap-2">
          <div>{integrationIcons[task.source]} </div>
          {dataSource &&
            (task.source === "TRACKER23" ? (
              <>{urlToKeyword(task.source, dataSource)}</>
            ) : (
              <Link target="_blank" href={dataSource}>
                {urlToKeyword(task.source, dataSource)}
              </Link>
            ))}
        </div>
      ),
    },
    {
      title: "Created",
      key: "createdAt",
      dataIndex: "createdAt",
      render: (createdAt: string) => (
        <>
          {isMobile
            ? new Date(createdAt).toLocaleDateString()
            : getFormattedTime(formatDate(createdAt))}
        </>
      ),
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
      key: "started",
      align: "center",
      title: "Started",
      dataIndex: "started",
      render: (_: any, task: TaskDto) => (
        <>
          {task.sessions?.length > 0
            ? isMobile
              ? new Date(
                  task.sessions.sort(
                    (a, b) =>
                      new Date(a.startTime).getTime() -
                      new Date(b.startTime).getTime()
                  )[0].startTime
                ).toLocaleDateString()
              : getFormattedTime(
                  formatDate(
                    task.sessions.sort(
                      (a, b) =>
                        new Date(a.startTime).getTime() -
                        new Date(b.startTime).getTime()
                    )[0].startTime
                  )
                )
            : "Not Started"}
        </>
      ),
      sorter: (a: TaskDto, b: TaskDto) => {
        return startTimeSorter(a, b);
      },
    },
    {
      key: "ended",
      title: "Ended",
      align: "center",
      dataIndex: "ended",
      render: (_: any, task: TaskDto) => (
        <>
          {task.sessions?.length > 0 && !checkIfRunningTask(task.sessions)
            ? isMobile
              ? new Date(
                  task.sessions.sort(
                    (a, b) =>
                      new Date(a.endTime).getTime() -
                      new Date(b.endTime).getTime()
                  )[task.sessions?.length - 1].endTime
                ).toLocaleDateString()
              : getFormattedTime(
                  formatDate(
                    task.sessions.sort(
                      (a, b) =>
                        new Date(a.endTime).getTime() -
                        new Date(b.endTime).getTime()
                    )[task.sessions?.length - 1].endTime
                  )
                )
            : task.sessions[0]
            ? "Running"
            : "Not Started"}
        </>
      ),
    },
    {
      width: 130,
      key: "estimation",
      title: `Estimation (${totalEstimation} H)`,
      dataIndex: "estimation",
      render: (_: any, task: TaskDto) => (
        <EstimationComponent {...{ task, handleEstimationChange }} />
      ),
      sorter: (a: any, b: any) => a.estimation - b.estimation,
    },
    {
      width: 150,
      key: "total",
      align: "center",
      dataIndex: "total",
      title: `Total Spent (${hours}H ${minutes}M)`,
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
      width: 70,
      key: "action",
      title: "Action",
      dataIndex: "",
      render: (_: any, task: TaskDto) => (
        <div className="flex cursor-pointer justify-end gap-2">
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
      showLessItems: true,
      showSizeChanger: true,
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
      onChange={handleTableChange}
      scroll={{ x: "max-content" }}
      rowClassName={getRowClassName}
      pagination={tableParams.pagination}
    />
  );
};

export default TableComponent;
