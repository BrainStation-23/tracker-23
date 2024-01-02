import { message } from "antd";
import { Session, StatusDto, TaskDto } from "models/tasks";

import { Project } from "@/storage/redux/projectsSlice";
import {
  deleteFromLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from "@/storage/storage";

import {
  formatDate,
  getFormattedTime,
  getFormattedTotalTime,
  getTimeFromDate,
  getTotalSpentTime,
} from "./timeActions";

export const updateTask = (task: any, taskName: string) => {
  try {
    const taskList = getLocalStorage("TaskList").filter(
      (tn: string) => tn !== taskName
    );
    if (taskList.includes(task.name)) {
      message.error("TaskName Exists");
      return false;
    } else {
      taskList.push(task.name);
      setLocalStorage("TaskList", taskList);
      console.log(
        "🚀 ~ file: taskActions.tsx:19 ~ updateTask ~ taskList",
        taskList
      );
      if (task?.totalTime >= 0) {
        setLocalStorage(task.name, task);
        deleteFromLocalStorage(taskName);
      }
      return true;
    }
  } catch (error) {
    return false;
  }
};

export const getStringFromArray = (val: string[]) => {
  let res = "";

  val?.forEach((v, index) => {
    index > 0 ? (res += "," + v) : (res += v);
  });
  return res;
};
export function sortByStatus(tasks: TaskDto[]): TaskDto[] {
  const order: Record<"IN_PROGRESS" | "TO_DO" | "DONE", number> = {
    IN_PROGRESS: 0,
    TO_DO: 1,
    DONE: 2,
  };

  return tasks.sort(
    (a, b) => order[a.statusCategoryName] - order[b.statusCategoryName]
  );
}
export const getLabels = (values: string[]) => {
  return values?.map((status) => {
    return JSON.parse(status).name;
  });
};

export const getProjectStatusList = (
  projects: Project[],
  projectId: number
) => {
  if (!projects) return [];
  for (const project of projects) {
    if (project.id === projectId) {
      const tmpArray = project.statuses?.map((status) => {
        return {
          name: status.name,
          statusCategoryName: status.statusCategoryName as StatusDto,
        };
      });
      return tmpArray.sort((a, b) => {
        const order = {
          TO_DO: 1,
          IN_PROGRESS: 2,
          DONE: 3,
        };

        return order[a.statusCategoryName] - order[b.statusCategoryName];
      });
    }
  }
};

export const checkIfRunningTask = (sessions: Session[]) => {
  for (const session of sessions) {
    if (!session?.endTime) return true;
  }
  return false;
};

export const getFormattedTasks = (tasks: TaskDto[]) => {
  let runningTask: TaskDto;
  const formattedTasks = tasks.map((task: TaskDto) => {
    task.sessions = task.sessions.sort(function compareFn(a, b) {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    if (checkIfRunningTask(task.sessions)) runningTask = task;
    const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
    return {
      ...task,
      startTime: formatDate(task.sessions[0]?.startTime),
      endTime: formatDate(task.sessions[task.sessions?.length - 1]?.endTime),
      // created: getFormattedTime(formatDate(task.createdAt)),
      total: total,
      percentage: task.estimation
        ? Math.round(
            getTotalSpentTime(task.sessions) / (task.estimation * 36000)
          )
        : -1,
      totalSpent: getTotalSpentTime(task.sessions),
    };
  });
  return {
    formattedTasks,
    runningTask,
  };
};

export const startTimeSorter = (a: TaskDto, b: TaskDto) => {
  const aStartTime = getTimeFromDate(a.sessions[0]?.startTime);
  const bStartTime = getTimeFromDate(b.sessions[0]?.startTime);
  if (aStartTime !== null && bStartTime !== null)
    return aStartTime - bStartTime;
  else if (bStartTime === null && aStartTime === null) return true;
  else if (aStartTime === null) return false;
  else return false;
};
