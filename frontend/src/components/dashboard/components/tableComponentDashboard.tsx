import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import Stopwatch from "@/components/stopWatch/tabular/timerComponent";
import MoreFunctionComponent from "@/components/tasks/components/moreFunction";
import ProgressComponent from "@/components/tasks/components/progressComponent";
import StaticProgressComponent from "@/components/tasks/components/progressComponentStatic";
import TimeDisplayComponent from "@/components/tasks/components/timeDisplayComponent";
import { getTotalSpentTime } from "@/services/timeActions";
import { getLocalStorage, setLocalStorage } from "@/storage/storage";
import { Button, Table, TablePaginationConfig, Typography } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { TableParams, TaskDto } from "models/tasks";
import { useState } from "react";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  statusBGColorEnum,
  statusBorderColorEnum,
  taskPriorityEnum,
  taskStatusEnum,
} from "utils/constants";

const { Text } = Typography;
const DashboardTableComponent = ({
  tasks,
  runningTask,
  setSelectedTask,
  setTaskViewModalOpen,
  deleteTask,
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
            {
              // task.status !== "DONE" &&
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
            }
            {/* {task.status === "DONE" && <div className="w-[34px]"></div>} */}
            <div className="flex flex-col gap-2">
              <Text className="w-[200px] " ellipsis={{ tooltip: task?.title }}>
                {/* <div>{task?.title}</div> */}
                {task?.title}
              </Text>
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
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // align: "center",
      render: (_: any, { status }: TaskDto) => (
        <div
          style={{
            backgroundColor: statusBGColorEnum[status],
            border: `1px solid ${statusBorderColorEnum[status]}`,
            borderRadius: "36px",
          }}
          className="flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: statusBorderColorEnum[status],
            }}
          />

          <div>{taskStatusEnum[status]}</div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "created",
      key: "created",
      // align: "center",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (_: any, { priority }: TaskDto) => (
        <div
          style={{
            backgroundColor: PriorityBGColorEnum[priority],
            border: `1px solid ${PriorityBorderColorEnum[priority]}`,
          }}
          className="w-min rounded px-2 text-black"
        >
          {taskPriorityEnum[priority]}
        </div>
      ),
    },

    {
      title: "Progress",
      dataIndex: "percentage",
      key: "percentage",

      // align: "center",
      render: (_: any, task: TaskDto) =>
        runningTask?.id != task.id ? (
          <StaticProgressComponent task={task} />
        ) : (
          <ProgressComponent task={task} />
        ),
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
    {
      title: "Estimation",
      dataIndex: "estimation",
      key: "estimation",
      render: (_: any, task: TaskDto) =>
        task.estimation ? (
          <div className="text-center">{task.estimation}hrs</div>
        ) : (
          <div className="text-center">---</div>
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
    <Table
      columns={columns}
      dataSource={tasks}
      // onChange={onChange}
      rowKey={(task) => task.id}
      pagination={tableParams.pagination}
      rowClassName={getRowClassName}
      onChange={handleTableChange}
    />
  );
};

export default DashboardTableComponent;
