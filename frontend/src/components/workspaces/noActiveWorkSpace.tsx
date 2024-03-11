import { Empty } from "antd";
import classNames from "classnames";

const NoActiveWorkspace = ({ className }: { className?: string }) => {
  return (
    <div
      className={classNames(
        "flex h-96 w-full items-center justify-center",
        className
      )}
    >
      <Empty description="No Active Workspace!" className="">
        Please create or select a workspace
      </Empty>
    </div>
  );
};

export default NoActiveWorkspace;
