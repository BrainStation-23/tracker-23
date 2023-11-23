import { QuestionCircleOutlined } from "@ant-design/icons";
import { Spin, Tooltip } from "antd";
import DateRangePicker from "../../datePicker";
import TopPanelReportPage from "./topPanelReportPage";

type Props = {
  children: any;
  title: string;
  tooltipMessage?: string;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: Function;
  topPanelComponent: any;
  sprints: string[];
  setSprints: Function;
};
const ReportWrapper = ({
  children,
  title,
  tooltipMessage,
  isLoading = false,
  activeTab,
  setActiveTab,
  topPanelComponent,
  sprints,
  setSprints,
}: Props) => {
  return (
    <div className="mt-5">
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-semibold">{title}</div>
        </div>
        <TopPanelReportPage
          {...{
            activeTab,
            setActiveTab,
            topPanelComponent,
            sprints,
            setSprints,
          }}
        />
        <Spin className="custom-spin" spinning={isLoading}>
          {
            <div className="flex w-full justify-center  overflow-auto">
              {children}
            </div>
          }
        </Spin>
      </div>
    </div>
  );
};

export default ReportWrapper;
