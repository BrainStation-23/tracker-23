import { getTotalSpentTime } from "@/services/timeActions";
import { Progress } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
import { progressColorEnum } from "utils/constants";
import { useEffect } from "react";
type Props = {
  task: TaskDto;
};
const ProgressComponent = ({ task }: Props) => {
  const totalSpent = getTotalSpentTime(task.sessions);
  const [time, setTime] = useState(totalSpent);
  useEffect(() => {
    let interval: any = null;
    interval = setInterval(() => {
      task.percentage = task.estimation
        ? Math.round(time / (task.estimation * 36000))
        : -1;
      setTime((time) => time + 1000);
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex w-max gap-3">
      <div style={{ width: 80 }}>
        {/* <Progress percent={30} size="small" />
          <Progress percent={50} size="small" status="active" />
           */}
        {task.percentage >= 0 && task.percentage < 100 ? (
          <Progress
            percent={Math.floor(time / (task.estimation * 36000))}
            size="small"
            strokeColor={progressColorEnum[task.status]}
            trailColor={progressColorEnum["BG"]}
            showInfo={false}
          />
        ) : task.percentage === 100 ? (
          <Progress
            percent={Math.floor(time / (task.estimation * 36000))}
            size="small"
            status="success"
            strokeColor={progressColorEnum[task.status]}
            trailColor={progressColorEnum["BG"]}
            showInfo={false}
          />
        ) : (
          <Progress
            percent={Math.floor(time / (task.estimation * 36000))}
            size="small"
            status="exception"
            // strokeColor={progressColorEnum[task.status]}
            trailColor={progressColorEnum["BG"]}
            showInfo={false}
          />
        )}
      </div>
      {(time / (task.estimation * 36000)).toFixed(1)}%
    </div>
  );
};

export default ProgressComponent;
