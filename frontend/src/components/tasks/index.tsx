import { useRouter } from "next/router";
import { Empty, message, Spin } from "antd";
import { createContext, useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

// Components
import Navbar from "@/components/navbar";
import SessionStartWarning from "./components/warning";
import TableComponent from "./components/tableComponent";
import GlobalModal from "@/components/modals/globalModal";
import ManualTimeEntry from "./components/manualTimeEntry";
import TopPanel from "@/components/common/topPanels/topPanel";
import CreateTaskComponent from "./components/createTaskComponent";
import { getDateRangeArray } from "@/components/common/datePicker";
import TaskDetailsModal from "@/components/modals/taskDetails.modal";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import TopPanelActiveSprint from "@/components/common/topPanels/topPanelActiveSprint";

// Models
import { CreateTaskDto, TaskDto } from "models/tasks";
import { SearchParamsModel } from "models/apiParams";

// Service
import { userAPI } from "APIs";
import { publicRoutes } from "utils/constants";
import { getFormattedTasks } from "@/services/taskActions";
import { getTotalSpentTime } from "@/services/timeActions";

// Storage
import { RootState } from "@/storage/redux/store";
import { setPriorities } from "@/storage/redux/prioritySlice";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { setSprintListReducer } from "@/storage/redux/tasksSlice";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import { setProjectsSlice, StatusType } from "@/storage/redux/projectsSlice";

export const TaskContext = createContext<any>({
  taskList: [],
  runningTask: null,
  handleWarning: null,
  selectedTask: null,
  setRunningTask: null,
});

const TasksPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const syncRunning = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );

  // State
  const path = router.asPath;

  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [warningData, setWarningData] = useState<any>([]);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string[]>([]);
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);
  const [checkedOptionList, setCheckedOptionList] = useState(["Search"]);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [activeSprintTasks, setActiveSprintTasks] = useState<TaskDto[]>([]);
  const [taskViewModalOpen, setTaskViewModalOpen] = useState<boolean>(false);
  const [sessionActionLoading, setSessionActionLoading] =
    useState<boolean>(false);
  const [manualTimeEntryModalOpen, setManualTimeEntryModalOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(
    router.query.tab === "pin" ? "Pin" : "All"
  );
  const [searchParams, setSearchParams] = useState<SearchParamsModel>({
    searchText: "",
    selectedDate: getDateRangeArray("this-week"),
    priority: [],
    status: [],
    sprints: [],
    types: [],
  });
  const [searchParamsActiveSprint, setSearchParamsActiveSprint] = useState({
    searchText: "",
    priority: [],
    status: [],
  });

  const createTask = async (data: CreateTaskDto) => {
    setLoading(true);
    try {
      const res = await userAPI.createTask(data);
      if (res) {
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
        }
      }
      setViewModalOpen(false);
    } catch (error) {
      message.error("Error creating task");
      setViewModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Handler
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
      if (res) {
        const { formattedTasks, runningTask } = getFormattedTasks(res);
        if (runningTask) setRunningTask(runningTask);
        setTasks(formattedTasks || []);
      }
    } catch (error) {
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };

  const getSyncingTasks = async () => {
    try {
      const res = await userAPI.getTasks(searchParams);
      if (res) {
        const { formattedTasks, runningTask } = getFormattedTasks(res);
        if (runningTask) setRunningTask(runningTask);
        setTasks(formattedTasks || []);
      }
      message.success(
        "We're retrieving your data and have obtained a portion already. More is on the way. Thank you for your patience."
      );
    } catch (error) {
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
    res && dispatch(setProjectsSlice(res));
    res && dispatch(setPriorities(res));
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
    if (res) message.success(`Task ${!task.pinned ? "Pinned" : "Unpinned"}`);
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
    if (res?.length > 0) dispatch(setSprintListReducer(res));
  };

  const getActiveSprintTasks = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getJiraActiveSprintTasks(
        searchParamsActiveSprint
      );
      if (res) {
        const { formattedTasks, runningTask } = getFormattedTasks(res);
        if (runningTask) setRunningTask(runningTask);
        setActiveSprintTasks(formattedTasks || []);
      }
    } catch (error) {
      console.log(
        "🚀 ~ file: index.tsx:468 ~ getActiveSprintTasks ~ error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Side Effect
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
  }, []);

  useEffect(() => {}, [reload, runningTask]);

  const getPinnedTasks = () => {
    return tasks.filter((task) => task.pinned);
  };

  useEffect(() => {
    !loading && getTasks();
  }, [searchParams]);

  useEffect(() => {
    !loading && getActiveSprintTasks();
  }, [searchParamsActiveSprint]);

  useEffect(() => {
    if (!loading && !syncRunning) {
      getProjects();
      getTasks();
      getSprintList();
      getActiveSprintTasks();
    }
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

    return () => clearTimeout(timeout);
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
      if (syncRunning) {
        myTimeout = setTimeout(getSyncStatus, 5000);
      }
    }

    return () => clearTimeout(myTimeout);
  }, [
    router,
    dispatch,
    syncRunning,
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
      <Navbar
        extraComponent={
          <PrimaryButton onClick={() => setViewModalOpen(true)}>
            <PlusIconSvg />
            Add Task
          </PrimaryButton>
        }
      />
      <div className="h-full overflow-y-auto px-8 pt-2">
        <div className="mb-4 flex justify-between">
          <h2 className="text-2xl font-bold">Tasks</h2>
        </div>
        {activeTab === "ActiveSprint" ? (
          <TopPanelActiveSprint
            {...{
              tasks,
              activeTab,
              setActiveTab,
              activeSprintTasks,
              checkedOptionList,
              setCheckedOptionList,
              searchParamsActiveSprint,
              setSearchParamsActiveSprint,
            }}
          />
        ) : (
          <TopPanel
            {...{
              tasks,
              activeTab,
              setActiveTab,
              searchParams,
              selectedSource,
              setSearchParams,
              checkedOptionList,
              activeSprintTasks,
              setSelectedSource,
              setCheckedOptionList,
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
                    reload,
                    setReload,
                    deleteTask,
                    setLoading,
                    runningTask,
                    stopSession,
                    startSession,
                    handlePinTask,
                    setSelectedTask,
                    handleStatusChange,
                    sessionActionLoading,
                    setTaskViewModalOpen,
                    handleEstimationChange,
                    setManualTimeEntryModalOpen,
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
          // isModalOpen={true}
          setIsModalOpen={setViewModalOpen}
          title="Add Task"
          width={540}
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
        />
      </div>
    </TaskContext.Provider>
  );
};

export default TasksPage;
