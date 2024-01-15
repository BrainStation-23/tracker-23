type Props = {
  spentTime: number;
  estimatedTime: number;
  exceedLimit?: number;
};
const TimeProgressComponent = ({
  spentTime,
  estimatedTime,
  exceedLimit = 2,
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
  return (
    <div className="h-4 w-full rounded-full bg-gray-200 text-xs">
      <div
        style={{
          width: `${
            exceededTime > 0 ? 100 : (spentTime * 100) / estimatedTime
          }%`,
        }}
        className={`flex h-4 rounded-full text-xs  ${
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
