import { Button, Empty, message, Spin } from "antd";
import { userAPI } from "APIs";
import { CreateTaskDto, TaskDto } from "models/tasks";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { publicRoutes } from "utils/constants";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import { checkIfRunningTask } from "@/services/taskActions";
import {
  formatDate,
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { setProjectsSlice, StatusType } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import { setSprintListReducer } from "@/storage/redux/tasksSlice";

import { getDateRangeArray } from "../datePicker";
import GlobalModal from "../modals/globalModal";
import TaskDetailsModal from "../modals/taskDetails.modal";
import CreateTaskComponent from "./components/createTaskComponent";
import ManualTimeEntry from "./components/manualTimeEntry";
import TableComponent from "./components/tableComponent";
import TopPanel from "./components/topPanel/topPanel";
import SessionStartWarning from "./components/warning";
import TopPanelActiveSprint from "./components/topPanel/topPanelActiveSprint";
import WorkspaceSelection from "../sideMenu/components/workspaceSection";

export const TaskContext = createContext<any>({
  taskList: [],
  runningTask: null,
  handleWarning: null,
  selectedTask: null,
  setRunningTask: null,
});

const TasksPage = () => {
  const router = useRouter();
  const path = router.asPath;

  const dispatch = useAppDispatch();

  const syncRunning = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );

  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [sessionActionLoading, setSessionActionLoading] =
    useState<boolean>(false);
  const [manualTimeEntryModalOpen, setManualTimeEntryModalOpen] =
    useState<boolean>(false);
  const [taskViewModalOpen, setTaskViewModalOpen] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningData, setWarningData] = useState<any>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [activeSprintTasks, setActiveSprintTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    router.query.tab === "pin" ? "Pin" : "All"
  );
  const [searchParams, setSearchParams] = useState({
    searchText: "",
    selectedDate: getDateRangeArray("this-week"),
    priority: [],
    status: [
      // '{"name":"To Do","statusCategoryName":"TO_DO"}',
      // '{"name":"In Progress","statusCategoryName":"IN_PROGRESS"}',
    ],
    sprints: [],
  });
  const [searchParamsActiveSprint, setSearchParamsActiveSprint] = useState({
    searchText: "",
    priority: [],
    status: [],
  });
  const [reload, setReload] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);
  const createTask = async (data: CreateTaskDto) => {
    setLoading(true);
    try {
      const res = await userAPI.createTask(data);
      message.success("Task created successfully");
      if (data.isRecurrent) {
        setViewModalOpen(false);
        getTasks();
      } else {
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
      }
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
        task.sessions = task.sessions.sort((a: any, b: any) =>
          a.endTime
            ? new Date(a.endTime).getTime()
            : 0 - b.endTime
            ? new Date(b.endTime).getTime()
            : 0
        );
        const ended =
          task.sessions && !checkIfRunningTask(task.sessions)
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
      console.log("🚀 ~ file: index.tsx:176 ~ getTasks ~ error:", error);
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };

  const getSyncingTasks = async () => {
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
        task.sessions = task.sessions.sort((a: any, b: any) =>
          a.endTime
            ? new Date(a.endTime).getTime()
            : 0 - b.endTime
            ? new Date(b.endTime).getTime()
            : 0
        );
        const ended =
          task.sessions && !checkIfRunningTask(task.sessions)
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
      message.success(
        "We're retrieving your data and have obtained a portion already. More is on the way. Thank you for your patience."
      );
    } catch (error) {
      console.log("🚀 ~ file: index.tsx:176 ~ getTasks ~ error:", error);
      message.error("Error getting tasks");
    }
  };
  const handleSessionStart = async (task: TaskDto) => {
    const session = await userAPI.createSession(task.id);
    if (session) {
      if (!task.sessions) task.sessions = [];
      task.sessions?.push(session);
      task.status = "In Progress";
      task.statusCategoryName = "IN_PROGRESS";
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
      if (session) {
        const tmp = tasks.map((t) =>
          t.id === task.id ? { ...task, sessions: [...task.sessions] } : t
        );
        setTasks(tmp);
      }
      setReload(!reload);
    } else message.error("Work log add Failed");
    setManualTimeEntryModalOpen(false);
  };
  const handleDeleteSession = (task: TaskDto, sessionId: number) => {
    if (sessionId) {
      if (!task.sessions) task.sessions = [];
      task.sessions = task.sessions.filter(
        (session: any) => session.id != sessionId
      );
      setReload(!reload);
    } else message.error("Work log delete Failed");
    // setManualTimeEntryModalOpen(false);
  };

  const handleUpdateSession = (task: TaskDto, session: any) => {
    if (session) {
      if (!task.sessions) task.sessions = [];
      task.sessions = task.sessions.map((tSession: any) =>
        session.id === tSession.id ? session : tSession
      );
      setReload(!reload);
    } else message.error("Work log add Failed");
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
    }
    setRunningTask(null);
    setSessionActionLoading(false);
  };
  const getProjects = async () => {
    const res = await userAPI.getIntegratedProjectStatuses();
    res?.length > 0 && dispatch(setProjectsSlice(res));
  };

  const handleStatusChange = async (task: TaskDto, value: StatusType) => {
    setLoading(true);
    const res = await userAPI.updateTaskSTatus(task.id, {
      status: value,
    });
    if (res) {
      task.status = res.status;
      task.statusCategoryName = res.statusCategoryName;
      message.success("Status Changed");
    }
    setReload(!reload);
    setLoading(false);
  };

  const handleEstimationChange = async (task: TaskDto, value: number) => {
    setLoading(true);
    const res = await userAPI.updateTaskEstimation(task.id, {
      estimation: value,
    });
    if (res) {
      const tmp = tasks.map((t) =>
        t.id === task.id ? { ...task, estimation: value } : t
      );
      setTasks(tmp);
    }
    setLoading(false);
  };

  const handlePinTask = async (task: TaskDto) => {
    setLoading(true);
    const res = await userAPI.pinTask(task.id, !task.pinned);
    if (res) message.success("Task Pinned");
    const tmp = tasks.map((t) =>
      t.id === task.id ? { ...task, pinned: !task.pinned } : t
    );
    setTasks(tmp);
    setLoading(false);
    if (res) return true;
    else return false;
  };

  const getSprintList = async () => {
    const res = await userAPI.getJiraSprints();
    console.log("🚀 ~ file: index.tsx:365 ~ getSprintList ~ res:", res);
    if (res?.length > 0) dispatch(setSprintListReducer(res));
  };

  const getActiveSprintTasks = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getJiraActiveSprintTasks(
        searchParamsActiveSprint
      );
      const tmpTasks = res.map((task: TaskDto) => {
        task.sessions = task.sessions.sort(function compareFn(a: any, b: any) {
          return a.id - b.id;
        });
        const started =
          task.sessions && task.sessions[0]
            ? getFormattedTime(formatDate(task.sessions[0].startTime))
            : "Not Started";
        task.sessions = task.sessions.sort((a: any, b: any) =>
          a.endTime
            ? new Date(a.endTime).getTime()
            : 0 - b.endTime
            ? new Date(b.endTime).getTime()
            : 0
        );
        const ended =
          task.sessions && !checkIfRunningTask(task.sessions)
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
      setActiveSprintTasks(tmpTasks || []);
    } catch (error) {
      console.log(
        "🚀 ~ file: index.tsx:468 ~ getActiveSprintTasks ~ error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };
  const syncFunction = async () => {
    dispatch(setSyncRunning(true));
    const res = await userAPI.syncStatus();
    res && dispatch(setSyncStatus(res));
  };

  useEffect(() => {
    if (tasks) {
      tasks.map((task) => {
        if (task.sessions[task.sessions?.length - 1]?.status === "STARTED") {
          setRunningTask(task);
        }
      });
    }
    getSprintList();
    getActiveSprintTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {}, [reload, runningTask]);

  const getPinnedTasks = () => {
    return tasks.filter((task) => task.pinned);
  };

  useEffect(() => {
    !loading && getTasks();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  useEffect(() => {
    !loading && getActiveSprintTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsActiveSprint]);
  useEffect(() => {
    if (!loading && !syncRunning) {
      getProjects();
      getTasks();
      getSprintList();
      getActiveSprintTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncRunning]);
  useEffect(() => {
    const getSyncStatus = async () => {
      const res = await userAPI.syncStatus();
      res && dispatch(setSyncStatus(res));
      if (res.status === "IN_PROGRESS") {
        dispatch(setSyncRunning(true));
      } else if (res.status === "DONE") {
        syncRunning && message.success("Sync Completed");
        dispatch(setSyncRunning(false));
      }
    };
    let timeout: NodeJS.Timeout;
    timeout =
      !publicRoutes.some((route) => path.includes(route)) &&
      setTimeout(getSyncStatus, 5000);
    const cleanup = () => {
      clearTimeout(timeout);
    };

    return cleanup;
  }, [publicRoutes.some((route) => path.includes(route))]);

  useEffect(() => {
    let myTimeout: NodeJS.Timeout;

    const getSyncStatus = async () => {
      if (syncRunning) {
        getSyncingTasks();
      } else {
        message.success("Sync Completed");
        getTasks();
        getSprintList();
        getActiveSprintTasks();
      }
    };

    if (!publicRoutes.includes(router.pathname)) {
      console.log(router.pathname);
      if (syncRunning) {
        myTimeout = setTimeout(getSyncStatus, 5000);
      }
    }

    const cleanup = () => {
      clearTimeout(myTimeout);
    };

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    syncRunning,
    router,
    publicRoutes.some((route) => path.includes(route)),
  ]);
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
            <Button
              type="primary"
              className="flex items-center gap-2 py-3 text-[15px] text-white"
              onClick={() => setViewModalOpen(true)}
            >
              <PlusIconSvg />
              Add Task
            </Button>
          </div>
        </div>
        {activeTab === "ActiveSprint" ? (
          <TopPanelActiveSprint
            {...{
              tasks,
              activeSprintTasks,
              activeTab,
              setActiveTab,
              searchParamsActiveSprint,
              setSearchParamsActiveSprint,
            }}
          />
        ) : (
          <TopPanel
            {...{
              tasks,
              activeSprintTasks,
              activeTab,
              setActiveTab,
              searchParams,
              setSearchParams,
            }}
          />
        )}

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
                    setLoading,
                    handleStatusChange,
                    handleEstimationChange,
                    handlePinTask,
                  }}
                />
              </div>
            ) : loading ? (
              <Empty description="Getting tasks" />
            ) : (
              <Empty description="No tasks" />
            )
          ) : activeTab === "Pin" ? (
            getPinnedTasks().length ? (
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
                    setLoading,
                    handleStatusChange,
                    handleEstimationChange,
                    handlePinTask,
                  }}
                />
              </div>
            ) : loading ? (
              <Empty description="Getting tasks" />
            ) : (
              <Empty description="No pinned tasks" />
            )
          ) : activeSprintTasks?.length ? (
            <div className="text-xs font-medium">
              <TableComponent
                tasks={activeSprintTasks}
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
                  setLoading,
                  handleStatusChange,
                  handleEstimationChange,
                  handlePinTask,
                }}
              />
            </div>
          ) : loading ? (
            <Empty description="Getting tasks" />
          ) : (
            <Empty description="No tasks in Active Sprints" />
          )}
        </Spin>

        <GlobalModal
          isModalOpen={viewModalOpen}
          setIsModalOpen={setViewModalOpen}
          title="Add Task"
          className="top-0 my-auto flex h-full items-center"
        >
          <CreateTaskComponent taskList={tasks} createTask={createTask} />
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
          handleDeleteSession={handleDeleteSession}
          handleUpdateSession={handleUpdateSession}
          // handleDelete={handleDelete}
        />
      </div>
      <WorkspaceSelection />
    </TaskContext.Provider>
  );
};

export default TasksPage;
