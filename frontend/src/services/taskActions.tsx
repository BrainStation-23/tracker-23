import {
  deleteFromLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from "@/storage/storage";
import { log } from "console";
import { TaskDto } from "models/tasks";
import { toast } from "react-toastify";

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
      toast.error("TaskName Exists");
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
  const order: Record<"IN_PROGRESS" | "TODO" | "DONE", number> = {
    IN_PROGRESS: 0,
    TODO: 1,
    DONE: 2,
  };

  return tasks.sort((a, b) => order[a.status] - order[b.status]);
}
