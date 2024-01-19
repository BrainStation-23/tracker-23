// Import react-circular-progressbar module and styles
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Props = {
  spentTime: number;
  estimatedTime: number;
  exceedLimit?: number;
  isDonut?: boolean;
};
const TimeProgressComponent = ({
  spentTime,
  estimatedTime,
  exceedLimit = 2,
  isDonut = false,
}: Props) => {
  console.log("TimeProgressComponent", spentTime, estimatedTime);
  const exceededTime =
    spentTime > estimatedTime ? Math.abs(spentTime - estimatedTime) : 0;

  if (estimatedTime === 0) {
    return <div>No Assigned Tasks</div>;
  }
  if (typeof estimatedTime !== "number") {
    return <></>;
  }
  return isDonut ? (
    <div className="h-5 w-5">
      <CircularProgressbar
        value={exceededTime > 0 ? 100 : (spentTime * 100) / estimatedTime}
        strokeWidth={16}
        styles={buildStyles({
          trailColor: "#D3D3D3",
          pathColor: `${
            exceededTime > exceedLimit
              ? "red"
              : exceededTime > 0
              ? "yellow"
              : "#6CAE2B"
          }`,
        })}
      />
    </div>
  ) : (
    <div className="h-[10px] w-full rounded-full bg-gray-200 text-xs">
      <div
        style={{
          width: `${
            exceededTime > 0 ? 100 : (spentTime * 100) / estimatedTime
          }%`,
        }}
        className={`flex h-[10px] rounded-full text-xs  ${
          exceededTime > exceedLimit
            ? "bg-red-500"
            : exceededTime > 0
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      />
    </div>
  );
};

export default TimeProgressComponent;
