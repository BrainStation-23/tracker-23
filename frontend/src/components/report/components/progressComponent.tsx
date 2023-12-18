type Props = {
  done: number;
  total: number;
};
const ProgressComponent = ({ done, total }: Props) => {
  if (total === 0) {
    return <div>No Assigned Tasks</div>;
  }
  if (typeof total !== "number") {
    return <></>;
  }
  return (
    <div className="h-4 w-full rounded bg-gray-200">
      <div
        style={{
          width: `${(done * 100) / total}%`,
        }}
        className="h-4 rounded bg-green-500"
      />
    </div>
  );
};

export default ProgressComponent;
