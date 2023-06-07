import { store } from "@/storage/redux/store";
import {
  setRunningTaskReducer,
  setTasksReducer,
} from "@/storage/redux/tasksSlice";
import { TaskDto } from "models/tasks";

export function setTasksSliceHook(tasks: TaskDto[]) {
  store.dispatch(setTasksReducer(tasks));
}

export function setRunningTaskHook(task: TaskDto) {
  store.dispatch(setRunningTaskReducer(task));
}

export function resetRunningTaskHook() {
  store.dispatch(setRunningTaskReducer(null));
}
