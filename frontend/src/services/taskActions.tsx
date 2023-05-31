import { Project } from "@/storage/redux/projectsSlice";
import {
  deleteFromLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from "@/storage/storage";
import { message } from "antd";
import { StatusDto, TaskDto } from "models/tasks";

export const updateTask = (task: any, taskName: string) => {
  console.log(task, taskName);

  try {
    const taskList = getLocalStorage("TaskList").filter(
      (tn: string) => tn !== taskName
    );
    console.log(
      "🚀 ~ file: taskActions.tsx:16 ~ updateTask ~ taskList",
      taskList
    );
    if (taskList.includes(task.name)) {
      console.log("Name exists");
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
