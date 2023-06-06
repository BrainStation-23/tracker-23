import { Project } from "@/storage/redux/projectsSlice";
import {
  deleteFromLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from "@/storage/storage";
import { message } from "antd";
import { Session, StatusDto, TaskDto } from "models/tasks";
import {
  formatDate,
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "./timeActions";
import { setRunningTaskHook } from "@/hooks/taskHooks";

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
      return project.statuses?.map((status) => {
        return {
          name: status.name,
          statusCategoryName: status.statusCategoryName as StatusDto,
        };
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
  const tmpTasks = tasks.map((task: TaskDto) => {
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
    if (ended === "Running") setRunningTaskHook(task);
    const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
    return {
      ...task,
      id: task.id,
      title: task?.title,
      description: task.description,
      estimation: task.estimation,
      startTime: formatDate(task.sessions[0]?.startTime),
      endTime: formatDate(task.sessions[task.sessions?.length - 1]?.endTime),
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
  return tmpTasks;
};
