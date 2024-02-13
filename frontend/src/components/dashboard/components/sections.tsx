import { Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";

import { QuestionCircleOutlined } from "@ant-design/icons";

type Props = { children: any; title: string; tooltipMessage?: string };
const DashboardSection = ({ children, title, tooltipMessage }: Props) => {
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
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <div>{title}</div>
            {tooltipMessage && (
              <div className="text-sm">
                <Tooltip title={tooltipMessage}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        <Spin className="custom-spin" spinning={isLoading}>
          {<div className="flex w-full justify-center">{children}</div>}
        </Spin>
      </div>
    </>
  );
};

export default DashboardSection;
