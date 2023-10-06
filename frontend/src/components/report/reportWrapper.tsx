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
    <div className="mt-5">
      
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-semibold">{title}</div>
          <DateRangePicker setSelectedDate={setDateRange} />
        </div>
        <Spin className="custom-spin" spinning={isLoading}>
          {<div className="flex w-full justify-center">{children}</div>}
        </Spin>
      </div>
    </div>
  );
};

export default ReportWrapper;
