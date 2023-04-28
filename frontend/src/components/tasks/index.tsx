import { Button, Empty, message, Spin } from "antd";
import { userAPI } from "APIs";
import { TaskDto } from "models/tasks";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

import {
    formatDate, getFormattedTime, getFormattedTotalTime, getTotalSpentTime,
} from "@/services/timeActions";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import { getLocalStorage, setLocalStorage } from "@/storage/storage";

import { getDateRangeArray } from "../datePicker";
import GlobalModal from "../modals/globalModal";
import TaskDetailsModal from "../modals/taskDetails.modal";
import ManualTimeEntry from "./components/manualTimeEntry";
import TableComponent from "./components/tableComponent";
import TaskInput from "./components/taskInput";
import TopPanel from "./components/topPanel";
import SessionStartWarning from "./components/warning";

export const TaskContext = createContext<any>({
  taskList: [],
  runningTask: null,
  handleWarning: null,
  selectedTask: null,
  setRunningTask: null,
});

const TasksPage = () => {
  const router = useRouter();
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [sessionActionLoading, setSessionActionLoading] =
    useState<boolean>(false);
  const [manualTimeEntryModalOpen, setManualTimeEntryModalOpen] =
    useState<boolean>(false);
  const [taskViewModalOpen, setTaskViewModalOpen] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningData, setWarningData] = useState<any>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    router.query.tab === "pin" ? "Pin" : "All"
  );
  const [searchParams, setSearchParams] = useState({
    searchText: "",
    selectedDate: getDateRangeArray("this-week"),
    priority: [],
    status: ["TODO", "IN_PROGRESS"],
  });
  const syncRunning = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const [reload, setReload] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);
  const createTask = async (data: any) => {
    setLoading(true);
    try {
      const res = await userAPI.createTask(data);
      message.success("Task created successfully");
      setTasks((tasks) => [res, ...tasks]);
      if (tasks) {
        tasks.map((task) => {
          if (
            task.sessions &&
            task.sessions[task.sessions?.length - 1]?.status === "STARTED"
          ) {
            setRunningTask(task);
          }
        });
      }
      setViewModalOpen(false);
    } catch (error) {
      message.error("Error creating task");
      setViewModalOpen(false);
    } finally {
      setLoading(false);
    }
  };
  const handleWarning = async (tmpTask: any) => {
    setWarningData(tmpTask);
    setWarningModalOpen(true);
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

  const deleteTask = async (taskId: any) => {
    setLoading(true);
    try {
      const res = await userAPI.deleteTask(taskId);
      if (res) {
        setTasks((tasks) => tasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      message.error("Error deleting task");
    } finally {
      setLoading(false);
    }
  };

  const getTasks = async () => {
    setLoading(true);
    let pinnedTasks = getLocalStorage("pinnedTasks");
    if (!pinnedTasks) pinnedTasks = [];
    try {
      const res = await userAPI.getTasks(searchParams);
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
          pinned: pinnedTasks.includes(task.id),
          id: task.id,
          title: task?.title,
          description: task.description,
          estimation: task.estimation,
          startTime: formatDate(task.sessions[0]?.startTime),
          endTime: formatDate(
            task.sessions[task.sessions?.length - 1]?.endTime
          ),
          started: started,
          created: getFormattedTime(formatDate(task.createdAt)),
          ended: ended,
          total: total,
          percentage: task.estimation
            ? Math.round(
                getTotalSpentTime(task.sessions) / (task.estimation * 36000)
              )
            : -1,
          totalSpent: getTotalSpentTime(task.sessions),
          priority: task.priority,
        };
      });
      setTasks(tmpTasks || []);
    } catch (error) {
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };
  const dispatch = useAppDispatch();
  const syncTasks = async () => {
    // setLoading(true);
    message.success("Syncing");
    let pinnedTasks = getLocalStorage("pinnedTasks");
    if (!pinnedTasks) pinnedTasks = [];
    try {
      dispatch(setSyncRunning(true));
      const res = await userAPI.syncTasks();
      res && dispatch(setSyncStatus(res));
      if (res.status === "IN_PROGRESS") {
        dispatch(setSyncRunning(true));
      } else {
        dispatch(setSyncRunning(false));
      }
    } catch (error) {
      message.error("Error syncing tasks");
    }
  };
  const handleSessionStart = async (task: TaskDto) => {
    const session = await userAPI.createSession(task.id);
    if (session) {
      if (!task.sessions) task.sessions = [];
      task.sessions?.push(session);
      task.status = "IN_PROGRESS";
      setRunningTask({ ...task });
      session && message.success("Session Started");
      setReload(!reload);
    } else message.error("Session Start Failed");
  };
  const handleAddManualSession = (task: TaskDto, session: any) => {
    if (session) {
      if (!task.sessions) task.sessions = [];
      task.sessions?.push(session);
      session && message.success("Work log added");
      setReload(!reload);
    } else message.error("Work log add Failed");
    setManualTimeEntryModalOpen(false);
  };
  const startSession = async (task: TaskDto) => {
    setSessionActionLoading(true);

    if (runningTask && runningTask?.id != task.id) {
      setWarningData(task);
      setWarningModalOpen(true);
    } else {
      await handleSessionStart(task);
    }
    setSessionActionLoading(false);
  };
  const stopSession = async (task: TaskDto) => {
    setSessionActionLoading(true);
    const session = await userAPI.stopSession(task.id);
    if (session) {
      task.sessions = task.sessions?.map((_session: any) => {
        if (_session.id === session.id) return session;
        else return _session;
      });
      const st: any = formatDate(session.endTime);
      const en: any = formatDate(session.startTime);
      console.log("🚀 🚀🚀🚀🚀🚀🚀🚀🚀", session, st - en);

      (task.percentage = task.estimation
        ? Math.round(
            getTotalSpentTime(task.sessions) / (task.estimation * 36000)
          )
        : -1),
        setTasks(
          tasks?.map((tmpTask) => {
            if (tmpTask?.id === task?.id) return { ...task };
            else return tmpTask;
          })
        );
      session && message.success("Session Ended");
    } else {
      task.sessions = task.sessions?.filter(
        (_session: any) => _session.endTime
      );
      setTasks(
        tasks?.map((tmpTask) => {
          if (tmpTask?.id === task?.id) return { ...task };
          else return tmpTask;
        })
      );
      // message.error("Session Ending Failed");
    }
    setReload(!reload);
    setRunningTask(null);
    setSessionActionLoading(false);
  };

  useEffect(() => {
    !loading && getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  useEffect(() => {
    !loading && !syncRunning && getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncRunning]);

  useEffect(() => {
    if (tasks) {
      tasks.map((task) => {
        if (task.sessions[task.sessions?.length - 1]?.status === "STARTED") {
          setRunningTask(task);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncFunction = async () => {
    dispatch(setSyncRunning(true));
    const res = await userAPI.syncStatus();
    res && dispatch(setSyncStatus(res));
  };

  useEffect(() => {}, [reload, runningTask]);

  const getPinnedTasks = () => {
    return tasks.filter((task) => task.pinned);
  };

  return (
    <TaskContext.Provider
      value={{
        tasklist: tasks,
        runningTask: runningTask,
        handleWarning,
        setRunningTask,
      }}
    >
      <div
        className="overflow-y-auto"
        // style={{ height: "calc(100vh - 100px)" }}
      >
        <div className="mb-4 flex justify-between">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="flex gap-1">
            {/* <Button
              onClick={() =>
                setManualTimeEntryModalOpen(!manualTimeEntryModalOpen)
              }
            >
              Manual Time
            </Button> */}
            <Button onClick={() => setViewModalOpen(true)}>Add Task</Button>
            {/* <Button
              className={`flex items-center justify-center ${
                syncRunning ? "border-green-500 text-green-500" : ""
              }`}
              onClick={async () => {
                await syncTasks();
              }}
            >
              <SyncOutlined spin={syncRunning} />
            </Button> */}
            {/* <Button
              className={`flex items-center justify-center ${
                syncRunning ? "border-green-500 text-green-500" : ""
              }`}
              onClick={syncFunction}
            >
              <SyncOutlined spin={syncRunning} /> Status
            </Button> */}
          </div>
        </div>
        <TopPanel
          {...{ tasks, activeTab, setActiveTab, searchParams, setSearchParams }}
        />

        <Spin spinning={loading}>
          {activeTab === "All" ? (
            tasks.length ? (
              <div className="text-xs font-medium">
                <TableComponent
                  {...{
                    tasks,
                    runningTask,
                    setSelectedTask,
                    setTaskViewModalOpen,
                    setManualTimeEntryModalOpen,
                    deleteTask,
                    startSession,
                    stopSession,
                    setReload,
                    reload,
                    sessionActionLoading,
                  }}
                />
              </div>
            ) : loading ? (
              <Empty description="Getting tasks" />
            ) : (
              <Empty description="No tasks" />
            )
          ) : getPinnedTasks().length ? (
            <div className="text-xs font-medium">
              <TableComponent
                tasks={getPinnedTasks()}
                {...{
                  runningTask,
                  setSelectedTask,
                  setTaskViewModalOpen,
                  setManualTimeEntryModalOpen,
                  deleteTask,
                  startSession,
                  stopSession,
                  setReload,
                  reload,
                  sessionActionLoading,
                }}
              />
            </div>
          ) : loading ? (
            <Empty description="Getting tasks" />
          ) : (
            <Empty description="No pinned tasks" />
          )}
        </Spin>

        <GlobalModal
          isModalOpen={viewModalOpen}
          setIsModalOpen={setViewModalOpen}
          title="Add Task"
          className="top-0 my-auto flex h-full items-center"
        >
          <TaskInput taskList={tasks} createTask={createTask} />
        </GlobalModal>
        <GlobalModal
          isModalOpen={manualTimeEntryModalOpen}
          setIsModalOpen={setManualTimeEntryModalOpen}
          title="Manual Time Entry"
          className="top-0 my-auto flex h-full items-center"
        >
          <ManualTimeEntry
            task={selectedTask}
            {...{ handleAddManualSession }}
          />
        </GlobalModal>
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
        <TaskDetailsModal
          task={selectedTask}
          isModalOpen={taskViewModalOpen}
          setIsModalOpen={setTaskViewModalOpen}
          // handleDelete={handleDelete}
        />
      </div>
    </TaskContext.Provider>
  );
};

export default TasksPage;
