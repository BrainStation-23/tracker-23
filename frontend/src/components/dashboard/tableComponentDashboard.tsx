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
import Link from "next/link";
import { urlToKeyword } from "@/services/helpers";

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
      width: isMobile ? 160 : 350,
      render: (_: any, task: TaskDto) => {
        return (
          <div className="flex w-40 items-center gap-2 overflow-hidden md:w-80">
            {task.source !== "OUTLOOK" ? (
              <>
                {runningTask?.id != task.id ? (
                  <div onClick={() => startSession(task)}>
                    <PlayIconSvg />
                  </div>
                ) : (
                  <div onClick={() => stopSession(task)}>
                    <PauseIconSvg />
                  </div>
                )}
              </>
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
    },
    {
      align: "center",
      title: "Source",
      key: "dataSource",
      dataIndex: "dataSource",
      render: (dataSource: any, task: TaskDto) => (
        <div className="flex w-full items-center justify-center gap-2">
          <div>{integrationIcons[task.source]} </div>
          {dataSource &&
            (task.source === "TRACKER23" ? (
              <>{urlToKeyword(task.source, dataSource)}</>
            ) : (
              <Link
                target="_blank"
                href={
                  task.source === "OUTLOOK"
                    ? "https://outlook.office.com/mail/"
                    : dataSource
                }
              >
                {urlToKeyword(task.source, dataSource)}
              </Link>
            ))}
        </div>
      ),
    },

    {
      align: "center",
      title: "Created",
      key: "createdAt",
      dataIndex: "createdAt",
      render: (_: any, task: TaskDto) => {
        return (
          <>
            {isMobile
              ? new Date(task.createdAt).toLocaleDateString()
              : getFormattedTime(formatDate(task.createdAt))}
          </>
        );
      },
    },
    {
      key: "started",
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
      align: "center",
      sorter: (a: TaskDto, b: TaskDto) => {
        return startTimeSorter(a, b);
      },
    },
    {
      key: "ended",
      title: "Ended",
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
      align: "center",
    },
    {
      key: "total",
      align: "center",
      dataIndex: "total",
      title: "Total Spent",
      width: isMobile ? 50 : 100,
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
      rowClassName={getRowClassName}
      bordered={isMobile ? true : false}
      pagination={tableParams.pagination}
      scroll={{ x: isMobile ? "max-content" : "100%" }}
    />
  );
};

export default DashboardTableComponent;
