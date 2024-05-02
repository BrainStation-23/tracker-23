import { useState } from "react";
import { TableParams, TaskDto } from "models/tasks";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { Table, TablePaginationConfig, Typography } from "antd";

import PlayIconSvg from "@/assets/svg/playIconSvg";
import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import Stopwatch from "@/components/stopWatch/tabular/timerComponent";
import TimeDisplayComponent from "@/components/tasks/timeDisplayComponent";
import { checkIfRunningTask, startTimeSorter } from "@/services/taskActions";
import { integrationIcons } from "@/components/integrations/components/importCard";
import {
  formatDate,
  getFormattedTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { useMediaQuery } from "react-responsive";

const { Text } = Typography;
const DashboardTableComponent = ({
  tasks,
  runningTask,
  startSession,
  stopSession,
}: any) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const columns: any = [
    {
      key: "title",
      fixed: "left",
      title: "Task Name",
      dataIndex: "title",
      width: isMobile ? 50 : 200,
      render: (_: any, task: TaskDto) => {
        return (
          <div className="flex items-center gap-2">
            {task.source !== "OUTLOOK" ? (
              <>
                {runningTask?.id != task.id ? (
                  <div
                    onClick={() => {
                      startSession(task);
                    }}
                  >
                    <PlayIconSvg />
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      stopSession(task);
                    }}
                  >
                    <PauseIconSvg />
                  </div>
                )}
              </>
            ) : (
              <div className="h-1 p-4" />
            )}
            <div className="flex flex-col gap-2">
              <Text className="w-48" ellipsis={{ tooltip: task?.title }}>
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
    },
    {
      title: "Source",
      key: "dataSource",
      dataIndex: "dataSource",
      width: isMobile ? 50 : 200,
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
      key: "createdAt",
      dataIndex: "createdAt",
      width: isMobile ? 50 : 200,
      render: (_: any, task: TaskDto) => {
        return <>{getFormattedTime(formatDate(task.createdAt))}</>;
      },
    },
    {
      key: "started",
      title: "Started",
      dataIndex: "started",
      width: isMobile ? 50 : 200,
      render: (_: any, task: TaskDto) => (
        <>
          {task.sessions?.length > 0
            ? getFormattedTime(formatDate(task.sessions[0].startTime))
            : "Not Started"}
        </>
      ),
      align: "center",
      sorter: (a: TaskDto, b: TaskDto) => {
        return startTimeSorter(a, b);
      },
    },
    {
      key: "ended",
      title: "Ended",
      dataIndex: "ended",
      width: isMobile ? 50 : 200,
      render: (_: any, task: TaskDto) => (
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
      key: "total",
      dataIndex: "total",
      title: "Total Spent",
      width: isMobile ? 50 : 100,
      fixed: isMobile ? "" : "right",
      render: (_: any, task: TaskDto) =>
        runningTask?.id !== task.id ? (
          <TimeDisplayComponent totalTime={getTotalSpentTime(task.sessions)} />
        ) : (
          <Stopwatch milliseconds={getTotalSpentTime(task.sessions)} />
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
  // const handlePin = (task: TaskDto) => {
  //   task.pinned
  //     ? (tableParams.pagination.total = tableParams.pagination.total - 1)
  //     : (tableParams.pagination.total = tableParams.pagination.total + 1);

  //   if (task.pinned) {
  //     let pinnedTasks = getLocalStorage("pinnedTasks");
  //     if (!pinnedTasks) pinnedTasks = [];
  //     pinnedTasks = pinnedTasks?.filter((taskId: any) => taskId != task.id);
  //     setLocalStorage("pinnedTasks", pinnedTasks);
  //   } else {
  //     let pinnedTasks = getLocalStorage("pinnedTasks");
  //     if (!pinnedTasks) pinnedTasks = [];
  //     pinnedTasks = pinnedTasks?.filter((taskId: any) => taskId != task.id);
  //     pinnedTasks.push(task.id);
  //     setLocalStorage("pinnedTasks", pinnedTasks);
  //   }
  //   task.pinned = !task.pinned;
  //   setReload(!reload);
  // };

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
      scroll={{ x: 1500 }}
      rowKey={(task) => task.id}
      onChange={handleTableChange}
      rowClassName={getRowClassName}
      bordered={isMobile ? true : false}
      pagination={tableParams.pagination}
    />
  );
};

export default DashboardTableComponent;
