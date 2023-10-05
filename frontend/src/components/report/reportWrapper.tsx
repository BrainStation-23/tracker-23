import { QuestionCircleOutlined } from "@ant-design/icons";
import { Spin, Tooltip } from "antd";
import DateRangePicker from "../datePicker";

type Props = {
  children: any;
  title: string;
  tooltipMessage?: string;
  setDateRange: Function;
  isLoading: boolean;
};
const ReportWrapper = ({
  children,
  title,
  tooltipMessage,
  setDateRange,
  isLoading = false,
}: Props) => {
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
          <DateRangePicker setSelectedDate={setDateRange} />
        </div>
        <Spin className="custom-spin" spinning={isLoading}>
          {<div className="flex w-full justify-center">{children}</div>}
        </Spin>
      </div>
    </>
  );
};

export default ReportWrapper;
