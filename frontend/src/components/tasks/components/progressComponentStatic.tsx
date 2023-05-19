import { getTotalSpentTime } from "@/services/timeActions";
import { Progress } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
import { progressColorEnum } from "utils/constants";
import { useEffect } from "react";
type Props = {
  task: TaskDto;
};
const StaticProgressComponent = ({ task }: Props) => {
  const totalSpent = getTotalSpentTime(task.sessions);
  const [time, setTime] = useState(totalSpent);

  return (
    <div className="flex w-max gap-3">
      <div style={{ width: 80 }}>
        {/* <Progress percent={30} size="small" />
          <Progress percent={50} size="small" status="active" />
           */}
        {Math.floor(time / (task.estimation * 36000)) >= 0 &&
        Math.floor(time / (task.estimation * 36000)) < 100 ? (
          <Progress
            percent={Math.floor(time / (task.estimation * 36000))}
            size="small"
            strokeColor={progressColorEnum[task.statusCategoryName]}
            trailColor={progressColorEnum["BG"]}
            showInfo={false}
          />
        ) : Math.floor(time / (task.estimation * 36000)) === 100 ? (
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
            // strokeColor={progressColorEnum[task.status]}
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

export default StaticProgressComponent;
