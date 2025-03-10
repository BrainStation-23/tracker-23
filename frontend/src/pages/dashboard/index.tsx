import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { Empty, message, Spin } from "antd";
import { TableParams, TaskDto } from "models/tasks";

// Components
import GlobalModal from "@/components/modals/globalModal";
import XYChart from "@/components/dashboard/charts/xyChart";
import SessionStartWarning from "@/components/tasks/warning";
import DashboardSection from "@/components/dashboard/sections";
import DonutChart from "@/components/dashboard/charts/donutChart";
import { getDateRangeArray } from "@/components/common/datePicker";
import DashboardTableComponent from "@/components/dashboard/tableComponentDashboard";

// Services
import { getFormattedTasks } from "@/services/taskActions";
import { getDayWithMonth, getTotalSpentTime } from "@/services/timeActions";

const DashboardPage = () => {
  const [reload, setReload] = useState(true);
  const [weekData, setWeekData] = useState(null);
  const [dataDonut, setDataDonut] = useState(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [warningData, setWarningData] = useState<any>([]);
  const [dataDonutTotal, setDataDonutTotal] = useState(0);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);

  const getPinnedTasks = () => {
    return tasks.filter((task) => task.pinned);
  };

  const [tableParamsPinned, setTableParamsPinned] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showLessItems: true,
      showSizeChanger: true,
      position: ["bottomRight", "bottomLeft"],
    },
  });

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

  useEffect(() => {
    const getTasks = async () => {
      try {
        const res = await userAPI.getTasks();
        if (res) {
          const { formattedTasks, runningTask } = getFormattedTasks(res);
          if (runningTask) setRunningTask(runningTask);
          const tmpPinnedTaskList = formattedTasks?.filter(
            (task: TaskDto) => task?.pinned
          );
          const pinnedTaskList = tmpPinnedTaskList;
          setTasks(pinnedTaskList || []);

          setTableParamsPinned({
            ...tableParamsPinned,
            pagination: {
              ...tableParamsPinned.pagination,
              total: pinnedTaskList.length,
            },
          });
        }
      } catch (error) {
        console.log("🚀 ~ file: index.tsx:238 ~ getTasks ~ error:", error);
      }
    };

    const getData = async () => {
      await getTasks();
      await getProjectWiseHour();
      await getSpentTimePerDay();
      setDataFetched(true);
    };

    if (reload) {
      getData();
      setReload(false);
    }
  }, [reload]);

  return (
    <>
      {dataFetched ? (
        <div className="flex flex-col gap-6 px-4 pb-12 pt-2 md:px-8">
          <div className="grid grid-cols-1">
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
          </div>
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

export default DashboardPage;
