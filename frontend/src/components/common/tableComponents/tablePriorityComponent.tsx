import { TaskDto } from "models/tasks";
import Image from "next/image";

import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  task: TaskDto;
};

const TablePriorityComponent = ({ task }: Props) => {
  const { priority, projectId } = task;
  const priorities = useAppSelector(
    (state: RootState) => state.prioritySlice.priorities
  );
  const p = priorities.find((pp) => {
    return pp.projectId == projectId && pp.name == task.priority;
  });
  return (
    <div
      style={{
        border: `1px solid ${p?.color}`,
      }}
      className="flex w-max gap-1 rounded px-1 text-black"
    >
      <Image
        src={p?.iconUrl}
        height={20}
        width={20}
        className="text-black"
        alt="X"
      />
      {priority}
    </div>
  );
};

export default TablePriorityComponent;
