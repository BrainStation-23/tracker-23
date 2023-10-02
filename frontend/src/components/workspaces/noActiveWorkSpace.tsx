import { Empty } from "antd";

const NoActiveWorkspace = () => {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Empty description="No Active Workspace!" className="">
        Please create or select a workspace
      </Empty>
    </div>
  );
};

export default NoActiveWorkspace;
