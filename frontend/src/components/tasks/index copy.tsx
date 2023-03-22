import { Button, Empty, Spin, message, Input } from "antd";
import { createContext, useEffect, useState } from "react";

import GlobalModal from "../modals/globalModal";
import SessionStartWarning from "./components/warning";
import SideCard from "./components/sideCard";
import { SyncOutlined } from "@ant-design/icons";
import { TaskDto } from "models/tasks";
import TaskInput from "./components/taskInput";
import VerticalCard from "./components/verticalCard";
import { userAPI } from "APIs";
const { Search } = Input;
export const TaskContext = createContext<any>({
  taskList: [],
  runningTask: null,
  handleWarning: null,
  selectedTask: null,
  setRunningTask: null,
});
const TasksPage = () => {
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningData, setWarningData] = useState<any>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [searchedTasks, setSearchedTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [runningTask, setRunningTask] = useState<TaskDto | null>(null);

  const createTask = async (data: any) => {
    setLoading(true);
    try {
      const res = await userAPI.createTask(data);
      message.success("Task created successfully");
      setTasks((tasks) => [res, ...tasks]);
      setSearchedTasks((tasks) => [res, ...tasks]);
      if (tasks) {
        tasks.map((task) => {
          if (task.sessions[task.sessions.length - 1]?.status === "STARTED") {
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
  const handleWarning = async (tmpTask: any, startFunction: Function) => {
    const tmp = [];
    tmp.push(tmpTask);
    tmp.push(startFunction);
    setWarningData(tmp);
    setWarningModalOpen(true);
  };
  const handleWarningClick = async (proceed: boolean) => {
    if (proceed) {
      await warningData[1]();
      setWarningData([]);
    }
    setWarningModalOpen(false);
  };

  const deleteTask = async (taskId: any) => {
    setLoading(true);
    try {
      const res = await userAPI.deleteTask(taskId);
      if (res) {
        setTasks((tasks) => tasks.filter((task) => task.id !== taskId));
        setSearchedTasks((tasks) => tasks.filter((task) => task.id !== taskId));
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
      const res = await userAPI.getTasks();
      setTasks([...res] || []);
      setSearchedTasks([...res] || []);
    } catch (error) {
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };
  const syncTasks = async () => {
    setLoading(true);
    try {
      const res = await userAPI.syncTasks();
      setTasks([...res] || []);
      setSearchedTasks([...res] || []);

      message.success("Sync Successful");
    } catch (error) {
      message.error("Error syncing tasks");
    } finally {
      setLoading(false);
    }
    setSyncing(false);
  };

  useEffect(() => {
    getTasks();
  }, []);

  useEffect(() => {
    if (searchText?.length > 0) {
      setSearchedTasks(
        tasks.filter((task) => {
          if (
            task?.title.includes(searchText) ||
            task.description.includes(searchText)
          )
            return task;
        })
      );
    } else {
      setSearchedTasks(tasks);
    }
  }, [searchText]);

  useEffect(() => {
    if (tasks) {
      tasks.map((task) => {
        if (task.sessions[task.sessions.length - 1]?.status === "STARTED") {
          setRunningTask(task);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log("runningTask", runningTask);

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
        className="mr-8 overflow-y-clip"
        style={{ height: "calc(100vh - 100px)" }}
      >
        <div className="mb-4 flex justify-between">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="flex gap-1">
            <Button onClick={() => setViewModalOpen(true)}>Add Task</Button>
            <Button
              className={`flex items-center justify-center ${
                syncing ? "border-green-500 text-green-500" : ""
              }`}
              onClick={async () => {
                setSyncing(true);
                await syncTasks();
              }}
            >
              <SyncOutlined spin={syncing} />
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          {tasks.length ? (
            <div className="grid grid-cols-2 gap-4 overflow-y-auto">
              <div
                className="flex flex-col gap-2 overflow-y-auto border-r-2 pr-2"
                style={{ height: "calc(100vh - 155px)" }}
              >
                <Search
                  placeholder="input search text"
                  onChange={(e) => {
                    setSearchText(e.target.value);
                  }}
                  allowClear
                />
                {searchedTasks.map((task) => (
                  <VerticalCard
                    key={task.id}
                    task={task}
                    deleteTask={deleteTask}
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                  />
                ))}
              </div>
              <div>
                {selectedTask ? (
                  <SideCard task={selectedTask} />
                ) : (
                  <Empty description="No task selected" />
                )}
              </div>
            </div>
          ) : loading ? (
            <Empty description="Getting tasks" />
          ) : (
            <Empty description="No tasks" />
          )}
        </Spin>

        <GlobalModal
          isModalOpen={viewModalOpen}
          setIsModalOpen={setViewModalOpen}
        >
          <TaskInput taskList={tasks} createTask={createTask} />
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
      </div>
    </TaskContext.Provider>
  );
};

export default TasksPage;
