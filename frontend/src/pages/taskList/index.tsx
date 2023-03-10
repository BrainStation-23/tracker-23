import { NextPage } from "next";
import TasksPage from "@/components/tasks";

const TaskList: NextPage = () => {
  return (
    <div className="w-full">
      <TasksPage />
    </div>
  );
};
export default TaskList;
