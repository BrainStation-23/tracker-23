import { Progress } from "antd";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import { progressColorEnum } from "utils/constants";
import { getTotalSpentTime } from "@/services/timeActions";

type Props = {
  task: TaskDto;
};

const ProgressComponent = ({ task }: Props) => {
  const totalSpent = getTotalSpentTime(task.sessions);
  const [time, setTime] = useState(totalSpent);

  useEffect(() => {
    setTime(getTotalSpentTime(task.sessions));
    let interval: any = null;
    interval = setInterval(() => {
      task.percentage = task.estimation
        ? Math.round(time / (task.estimation * 36000))
        : -1;
      setTime((time) => time + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [task, time]);

  return (
    <div className="flex w-max gap-3">
      <div style={{ width: 80 }}>
        {task.percentage >= 0 && task.percentage < 100 ? (
          <Progress
            percent={Math.floor(time / (task.estimation * 36000))}
            size="small"
            strokeColor={progressColorEnum[task.statusCategoryName]}
            trailColor={progressColorEnum["BG"]}
            showInfo={false}
          />
        ) : task.percentage === 100 ? (
          <Progress
            percent={Math.floor(time / (task.estimation * 36000))}
            size="small"
            status="success"
            strokeColor={progressColorEnum[task.statusCategoryName]}
            trailColor={progressColorEnum["BG"]}
            showInfo={false}
          />
        ) : (
          <Progress
            percent={Math.floor(time / (task.estimation * 36000))}
            size="small"
            status="exception"
            trailColor={progressColorEnum["BG"]}
            showInfo={false}
          />
        )}
      </div>
      {task.estimation ? (
        <> {(time / (task.estimation * 36000)).toFixed(1)}%</>
      ) : (
        <>0%</>
      )}
    </div>
  );
};

export default ProgressComponent;
