import { Empty, message, Spin, TablePaginationConfig, Typography } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { userAPI } from "APIs";
import { TableParams, TaskDto } from "models/tasks";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";

import PauseIconSvg from "@/assets/svg/pauseIconSvg";
import PlayIconSvg from "@/assets/svg/playIconSvg";
import XYChart from "@/components/dashboard/charts/xyChart";
import {
  formatDate,
  getDayWithMonth,
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";

import TablePriorityComponent from "../common/tableComponents/tablePriorityComponent";
import { getDateRangeArray } from "../datePicker";
import GlobalModal from "../modals/globalModal";
import Stopwatch from "../stopWatch/tabular/timerComponent";
import ProgressComponent from "../tasks/components/progressComponent";
import StaticProgressComponent from "../tasks/components/progressComponentStatic";
import TimeDisplayComponent from "../tasks/components/timeDisplayComponent";
import SessionStartWarning from "../tasks/components/warning";
import DonutChart from "./charts/donutChart";
import DashboardSection from "./components/sections";
import DashboardTableComponent from "./components/tableComponentDashboard";

const { Text } = Typography;

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [dataDonutTotal, setDataDonutTotal] = useState(0);
  const [dataDonut, setDataDonut] = useState(null);

  const [weekData, setWeekData] = useState(null);

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
  const [reload, setReload] = useState(false);

  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [morePin, setMorePin] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [warningData, setWarningData] = useState<any>([]);
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
    let pinnedTasks = [];
    try {
      const res = await userAPI.getTasks();
      if (res) {
        const tmpTasks = res.map((task: TaskDto) => {
          task.sessions = task.sessions.sort(function compareFn(
            a: any,
            b: any
          ) {
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
            started: started,
            ended: ended,
            total: total,
            created: getFormattedTime(formatDate(task.createdAt)),
          };
        });
        const tmpPinnedTaskList = tmpTasks?.filter(
          (task: TaskDto) => task?.pinned
        );
        if (tmpPinnedTaskList?.length > 5) setMorePin(true);
        const pinnedTaskList = tmpPinnedTaskList;
        setTasks(pinnedTaskList || []);

        setTableParamsPinned({
          ...tableParamsPinned,
          pagination: {
            ...tableParamsPinned.pagination,
            total: pinnedTaskList.length,
            // total: data.totalCount,
          },
        });
      }
    } catch (error) {
      console.log("🚀 ~ file: index.tsx:238 ~ getTasks ~ error:", error);
      // message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleWarningClick = async (proceed: boolean) => {
    setWarningModalOpen(false);
    if (proceed) {
      try {
        await stopSession(runningTask);
        setRunningTask(warningData);
        await handleSessionStart(warningData);
        setWarningData(null);
      } catch (error) {
        message.error("Something went wrong.");
      }
    }
    setWarningModalOpen(false);
  };
  const handleSessionStart = async (task: TaskDto) => {
    const session = await userAPI.createSession(task.id);
    if (session) {
      if (!task.sessions) task.sessions = [];
      task.sessions?.push(session);
      task.status = "In Progress";
      setRunningTask({ ...task });
      session && message.success("Session Started");
      setReload(!reload);
    } else message.error("Session Start Failed");
  };
  const startSession = async (task: TaskDto) => {
    if (runningTask && runningTask?.id != task.id) {
      setWarningData(task);
      setWarningModalOpen(true);
    } else {
      await handleSessionStart(task);
    }
  };
  const stopSession = async (task: TaskDto) => {
    const session = await userAPI.stopSession(task.id);
    if (session) {
      task.sessions = task.sessions?.map((_session: any) => {
        if (_session.id === session.id) return session;
        else return _session;
      });
      const st: any = formatDate(session.endTime);
      const en: any = formatDate(session.startTime);

      (task.percentage = task.estimation
        ? Math.round(
            getTotalSpentTime(task.sessions) / (task.estimation * 36000)
          )
        : -1),
        setRunningTask(null);
      session && message.success("Session Ended");
      setReload(!reload);
    } else {
      task.sessions = task.sessions?.filter(
        (_session: any) => _session.endTime
      );
      setRunningTask(null);
      setTasks(
        tasks?.map((tmpTask) => {
          if (tmpTask?.id === task?.id) return { ...task };
          else return tmpTask;
        })
      );
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
      render: (_: any, task: TaskDto) => (
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

          <div>{task.status}</div>
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
      render: (_: any, task: TaskDto) => <TablePriorityComponent task={task} />,
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
          // <StopWatchTabular
          //   task={task}
          //   // sessions={task.sessions}
          //   // runningTask={runningTask}
          //   addSession={() => {}}
          //   addEndTime={() => {}}
          // />
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

  const getProjectWiseHour = async () => {
    const res = await userAPI.getProjectWiseHour(
      getDateRangeArray("this-month")
    );
    const { value } = res;
    const tmp: any[] = [];
    value?.forEach((val: any) => {
      tmp.push(val);
    });
    setDataDonut(tmp);
    setDataDonutTotal(res.TotalSpentTime);
  };

  const getSpentTimePerDay = async () => {
    const res = await userAPI.getSpentTimePerDay(
      getDateRangeArray("this-week")
    );
    const tmp: any[] = [];
    typeof res === "object" &&
      res?.forEach((val: any) => {
        tmp.push({ day: getDayWithMonth(val.day), hours: val.hour });
      });
    setWeekData(tmp);
  };

  const getData = async () => {
    await getTasks();
    await getProjectWiseHour();
    await getSpentTimePerDay();
    setDataFetched(true);
  };

  useEffect(() => {
    getData();
    // getTasks();
    // getProjectWiseHour();
    // getSpentTimePerDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {dataFetched ? (
        <div className="flex flex-col gap-6 pb-12">
          <div className="grid grid-cols-1">
            {/* <div className="grid grid-cols-2"> */}
            <DashboardSection
              title="Project wise Track hour"
              tooltipMessage="This Month"
            >
              {dataDonut?.length > 0 ? (
                <DonutChart data={dataDonut} total={dataDonutTotal} />
              ) : (
                <Empty className="pt-20" description="No Data" />
              )}
            </DashboardSection>
            {/* <DashboardSection title="Actual VS Estimate">
          <Line data={lineChartData} />
        </DashboardSection> */}
          </div>
          {/* <DashboardSection title="Pinned tasks">
        <Table
          columns={columns}
          dataSource={getPinnedTasks()}
          // onChange={onChange}
          size="small"
          rowKey={(record) => record.id}
          pagination={null}
          // pagination={tableParamsPinned.pagination}
          rowClassName={getRowClassName}
          onChange={handleTableChange}
          scroll={{
            scrollToFirstRowOnChange: true,
            x: true,
          }}
        />
        {morePin && (
          <div
            className="absolute bottom-0 right-1/2 left-1/2 w-max cursor-pointer "
            onClick={() => {
              router.push("/taskList?tab=pin");
            }}
          >
            {" "}
            Click to View More
          </div>
        )}
      </DashboardSection> */}
          <DashboardSection title="Pinned tasks">
            <DashboardTableComponent
              tasks={getPinnedTasks()}
              {...{
                runningTask,
                startSession,
                stopSession,
                setReload,
                reload,
              }}
            />
          </DashboardSection>
          <DashboardSection title="Tracker By Day" tooltipMessage="This Week">
            {weekData?.length > 0 ? (
              <XYChart data={weekData} />
            ) : (
              <Empty className="py-20" description="No Data" />
            )}
          </DashboardSection>

          {/* <div>
        <MyTasks />
      </div> */}
          <GlobalModal
            isModalOpen={warningModalOpen}
            setIsModalOpen={setWarningModalOpen}
          >
            <SessionStartWarning
              runningTask={runningTask}
              warningData={warningData}
              handleWarningClick={handleWarningClick}
            />
          </GlobalModal>
        </div>
      ) : (
        <Spin className="mt-[200px] h-[500px] w-full"></Spin>
      )}
    </>
  );
};

export default Dashboard;
