import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import PieChart from "@/components/dashboard/charts/pieChart";
import XYChart from "@/components/dashboard/charts/xyChart";
import MyTasks from "@/components/dashboard/myTasks";
import {
  formatDate,
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { getLocalStorage } from "@/storage/storage";
import { Button, message, Progress, Table, TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { userAPI } from "APIs";
import { TableParams, TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  progressColorEnum,
  statusBGColorEnum,
  statusBorderColorEnum,
  taskPriorityEnum,
  taskStatusEnum,
} from "utils/constants";
import StopWatchTabular from "../stopWatch/tabular/reactStopWatchTabular";
import DonutChart from "./charts/donutChart";

const DashBoard = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const data = [
    { category: "Frontend", value: 20 },
    { category: "Misc", value: 25 },
    { category: "Testing", value: 15 },
    { category: "UI", value: 10 },
    { category: "Backend", value: 30 },
  ];
  const data2 = [
    { day: 1, hours: 3 },
    { day: 2, hours: 8 },
    { day: 3, hours: 1 },
    { day: 4, hours: 7 },
    { day: 5, hours: 4 },
    { day: 6, hours: 0 },
    { day: 7, hours: 5 },
    { day: 8, hours: 7 },
    { day: 9, hours: 2 },
    { day: 10, hours: 8 },
    { day: 11, hours: 2 },
    { day: 12, hours: 5 },
    { day: 13, hours: 1 },
    { day: 14, hours: 8 },
    { day: 15, hours: 0 },
    { day: 16, hours: 3 },
    { day: 17, hours: 5 },
    { day: 18, hours: 8 },
    { day: 19, hours: 1 },
    { day: 20, hours: 6 },
    { day: 21, hours: 2 },
    { day: 22, hours: 3 },
    { day: 23, hours: 4 },
    { day: 24, hours: 8 },
    { day: 25, hours: 3 },
    { day: 26, hours: 0 },
    { day: 27, hours: 4 },
    { day: 28, hours: 7 },
    { day: 29, hours: 1 },
    { day: 30, hours: 5 },
  ];
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<TaskDto> | SorterResult<TaskDto>[]
  ) => {
    setTableParamsPinned({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
    //   setData([]);
    // }
  };
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);
  const getPinnedTasks = () => {
    return tasks.filter((task) => task.pinned);
  };
  const [tableParamsPinned, setTableParamsPinned] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showLessItems: true,
      position: ["bottomRight", "bottomLeft"],

      // total: 100,
    },
  });
  const getRowClassName = (task: TaskDto, index: any) => {
    if (!task.sessions) task.sessions = [];
    return runningTask?.id === task.id ? "bg-[#F3FCFF]" : "";
  };
  const getTasks = async () => {
    setLoading(true);
    let pinnedTasks = getLocalStorage("pinnedTasks");
    if (!pinnedTasks) pinnedTasks = [];
    try {
      const res = await userAPI.getTasks();
      console.log("🚀 ~ file: index.tsx:112 ~ getTasks ~ res:", res);
      const tmpTasks = res.map((task: TaskDto) => {
        task.sessions = task.sessions.sort(function compareFn(a: any, b: any) {
          return a.id - b.id;
        });

        const started =
          task.sessions && task.sessions[0]
            ? getFormattedTime(formatDate(task.sessions[0].startTime))
            : "Not Started";
        const ended =
          task.sessions && task.sessions[task.sessions?.length - 1]?.endTime
            ? getFormattedTime(
                formatDate(task.sessions[task.sessions?.length - 1]?.endTime)
              )
            : task.sessions[0]
            ? "Running"
            : "Not Started";

        if (ended === "Running") setRunningTask(task);
        const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
        return {
          ...task,
          pinned: pinnedTasks?.includes(task?.id),
          id: task?.id,
          title: task?.title,
          // description: task?.description,
          // estimation: task?.estimation,
          // startTime: formatDate(task?.sessions[0]?.startTime),
          // endTime: formatDate(
          //   task?.sessions[task?.sessions?.length - 1]?.endTime
          // ),
          started: started,
          ended: ended,
          total: total,
          // percentage: task?.estimation
          //   ? Math.round(
          //       getTotalSpentTime(task?.sessions) / (task?.estimation * 36000)
          //     )
          //   : -1,
          // totalSpent: getTotalSpentTime(task?.sessions),
          // priority: task?.priority,
        };
      });
      console.log("****************************************");
      const pinnedTaskList = tmpTasks?.filter((task: TaskDto) => task?.pinned);
      console.log(
        "🚀 ~ file: index.tsx:154 ~ getTasks ~ tmpTasks:",
        tmpTasks,
        pinnedTaskList
      );
      setTasks(pinnedTaskList || []);
      console.log(">>>>>", pinnedTaskList, pinnedTaskList.length);

      setTableParamsPinned({
        ...tableParamsPinned,
        pagination: {
          ...tableParamsPinned.pagination,
          total: pinnedTaskList.length,
          // 200 is mock data, you should read it from server
          // total: data.totalCount,
        },
      });
    } catch (error) {
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };
  const columns: any = [
    {
      title: "Task Name",
      dataIndex: "title",
      key: "title",
      render: (_: any, task: TaskDto) => {
        return (
          <div className=" flex items-center gap-2">
            {/* {
              runningTask?.id != task.id ? (
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
              )
            } */}
            <div className="flex flex-col gap-2">
              <div>{task?.title}</div>
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
    // {
    //   title: "Date",
    //   dataIndex: "started",
    //   key: "started",
    // },
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
      render: (_: any, record: TaskDto) => (
        <div className="flex w-max gap-3">
          <div style={{ width: 80 }}>
            {/* <Progress percent={30} size="small" />
          <Progress percent={50} size="small" status="active" />
           */}
            {record.percentage >= 0 && record.percentage < 100 ? (
              <Progress
                percent={record.percentage}
                size="small"
                strokeColor={progressColorEnum[record.status]}
                trailColor={progressColorEnum["BG"]}
                showInfo={false}
              />
            ) : record.percentage === 100 ? (
              <Progress
                percent={record.percentage}
                size="small"
                status="success"
                strokeColor={progressColorEnum[record.status]}
                trailColor={progressColorEnum["BG"]}
                showInfo={false}
              />
            ) : (
              <Progress
                percent={record.percentage}
                size="small"
                status="exception"
                // strokeColor={progressColorEnum[record.status]}
                trailColor={progressColorEnum["BG"]}
                showInfo={false}
              />
            )}
          </div>
          {record.percentage >= 0 ? <>{record.percentage}%</> : <>0%</>}
        </div>
      ),
    },
    {
      title: "Total Spent",
      dataIndex: "total",
      key: "total",
      // align: "center",
      render: (_: any, task: TaskDto) => (
        <StopWatchTabular
          task={task}
          // sessions={task.sessions}
          // runningTask={runningTask}
          addSession={() => {}}
          addEndTime={() => {}}
        />
      ),
      colSpan: 0.1,
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
    // {
    //   title: "",
    //   dataIndex: "",
    //   key: "",

    //   render: (_: any, task: TaskDto) => (
    //     <div className="flex justify-end gap-2">
    //       <Button
    //         className="h-10 text-sm font-semibold"
    //         onClick={() => {
    //           // setSelectedTask(task);
    //           // setTaskViewModalOpen(true);
    //         }}
    //       >
    //         View
    //       </Button>
    //       {/* <MoreFunctionComponent {...{ task, deleteTask, handlePin }} /> */}
    //     </div>
    //   ),
    // },
    // {
    //   title: "Tags",
    //   key: "tags",
    //   dataIndex: "tags",
    //   render: (_, { tags }) => (
    //     <>
    //       {tags.map((tag) => {
    //         let color = tag.length > 5 ? "geekblue" : "green";
    //         if (tag === "loser") {
    //           color = "volcano";
    //         }
    //         return (
    //           <Tag color={color} key={tag}>
    //             {tag.toUpperCase()}
    //           </Tag>
    //         );
    //       })}
    //     </>
    //   ),
    // },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <a>Invite {record.name}</a>
    //       <a>Delete</a>
    //     </Space>
    //   ),
    // },
  ];
  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <DonutChart data={data} />
      <div className="">
        <div className="flex flex-col gap-2 ">
          <div className="text-lg font-semibold ">Pinned tasks</div>
          <Table
            columns={columns}
            dataSource={getPinnedTasks()}
            // onChange={onChange}
            size="small"
            rowKey={(record) => record.id}
            pagination={tableParamsPinned.pagination}
            rowClassName={getRowClassName}
            onChange={handleTableChange}
            scroll={{
              scrollToFirstRowOnChange: true,
              x: true,
            }}
          />
        </div>
        <div>
          <PieChart data={data} title="Work Distribution" />
        </div>
      </div>
      <div className="">
        <h1>Monthly Work Chart</h1>
        <XYChart data={data2} />
      </div>
      <PieChart data={data} title="Work Distribution" />
      <div> Dash Board</div>
      <MyTasks />
    </>
  );
};

export default DashBoard;
