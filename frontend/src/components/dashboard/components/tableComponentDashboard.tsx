import { Table, TablePaginationConfig, Typography } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { TableParams, TaskDto } from "models/tasks";
import { useState } from "react";

import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import { integrationIcons } from "@/components/importSection/importCard";
import Stopwatch from "@/components/stopWatch/tabular/timerComponent";
import TimeDisplayComponent from "@/components/tasks/components/timeDisplayComponent";
import { checkIfRunningTask, startTimeSorter } from "@/services/taskActions";
import {
  formatDate,
  getFormattedTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { getLocalStorage, setLocalStorage } from "@/storage/storage";

const { Text } = Typography;
const DashboardTableComponent = ({
  tasks,
  runningTask,
  startSession,
  stopSession,
  setReload,
  reload,
}: any) => {
  const columns: any = [
    {
      title: "Task Name",
      dataIndex: "title",
      key: "title",
      render: (_: any, task: TaskDto) => {
        return (
          <div className=" flex items-center gap-2">
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
              <div className="h-1 p-4"></div>
            )}
            {/* {task.status === "DONE" && <div className="w-[34px]"></div>} */}
            <div className="flex flex-col gap-2">
              <Text className="w-[200px] " ellipsis={{ tooltip: task?.title }}>
                {/* <div>{task?.title}</div> */}
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
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   // align: "center",
    //   render: (_: any, task: TaskDto) => (
    //     <div
    //       style={{
    //         backgroundColor: statusBGColorEnum[task.statusCategoryName],
    //         border: `1px solid ${
    //           statusBorderColorEnum[task.statusCategoryName]
    //         }`,
    //         borderRadius: "36px",
    //       }}
    //       className="relative flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
    //     >
    //       <div
    //         className="h-2 w-2 rounded-full"
    //         style={{
    //           backgroundColor: statusBorderColorEnum[task.statusCategoryName],
    //         }}
    //       />

    //       <div>{task.status}</div>
    //     </div>
    //   ),
    // },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      // align: "center",
    },
    // {
    //   title: "Priority",
    //   dataIndex: "priority",
    //   key: "priority",
    //   render: (_: any, task: TaskDto) => <TablePriorityComponent task={task} />,
    // },

    // {
    //   title: "Progress",
    //   dataIndex: "percentage",
    //   key: "percentage",

    //   // align: "center",
    //   render: (_: any, task: TaskDto) =>
    //     runningTask?.id != task.id ? (
    //       <StaticProgressComponent task={task} />
    //     ) : (
    //       <ProgressComponent task={task} />
    //     ),
    // },
    {
      title: "Started",
      dataIndex: "started",
      key: "started",
      render: (started: any, task: TaskDto) => (
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
      // align: "center",
      render: (_: any, task: TaskDto) =>
        runningTask?.id !== task.id ? (
          <TimeDisplayComponent totalTime={getTotalSpentTime(task.sessions)} />
        ) : (
          <Stopwatch milliseconds={getTotalSpentTime(task.sessions)} />
        ),
    },
    // {
    //   title: "Estimation",
    //   dataIndex: "estimation",
    //   key: "estimation",
    //   render: (_: any, task: TaskDto) =>
    //     task.estimation ? (
    //       <div className="text-center">
    //         <FormatTimeForSettings time={task.estimation} />
    //       </div>
    //     ) : (
    //       <div className="text-center">---</div>
    //     ),
    // },
  ];
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showLessItems: true,
      position: ["bottomRight", "bottomLeft"],

      // total: 100,
    },
  });
  const handlePin = (task: TaskDto) => {
    task.pinned
      ? (tableParams.pagination.total = tableParams.pagination.total - 1)
      : (tableParams.pagination.total = tableParams.pagination.total + 1);

    if (task.pinned) {
      let pinnedTasks = getLocalStorage("pinnedTasks");
      if (!pinnedTasks) pinnedTasks = [];
      pinnedTasks = pinnedTasks?.filter((taskId: any) => taskId != task.id);
      setLocalStorage("pinnedTasks", pinnedTasks);
    } else {
      let pinnedTasks = getLocalStorage("pinnedTasks");
      if (!pinnedTasks) pinnedTasks = [];
      pinnedTasks = pinnedTasks?.filter((taskId: any) => taskId != task.id);
      pinnedTasks.push(task.id);
      setLocalStorage("pinnedTasks", pinnedTasks);
    }
    task.pinned = !task.pinned;
    setReload(!reload);
  };

  const getRowClassName = (task: TaskDto, index: any) => {
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

    // `dataSource` is useless since `pageSize` changed
    // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
    //   setData([]);
    // }
  };
  return (
    <div className="w-full">
      <Table
        columns={columns}
        dataSource={tasks}
        // onChange={onChange}
        rowKey={(task) => task.id}
        pagination={tableParams.pagination}
        rowClassName={getRowClassName}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default DashboardTableComponent;
