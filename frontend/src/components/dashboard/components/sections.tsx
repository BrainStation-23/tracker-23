import { Spin } from "antd";
import { useEffect, useState } from "react";

type Props = { children: any; title: string };
const DashboardSection = ({ children, title }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);
  return (
    <>
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold ">{title}</div>
          {/* <div className=" rounded-lg border-2 p-1 px-2 text-sm">This Week</div> */}
        </div>
        <Spin className="custom-spin" spinning={isLoading}>
          {<div>{children}</div>}
        </Spin>
      </div>
    </>
  );
};

export default DashboardSection;
