import { Spin, Tooltip } from "antd";
import { SprintReportDto } from "models/reports";

import TopPanelReportPage from "./topPanelReportPage";

type Props = {
  children: any;
  title: string;
  tooltipMessage?: string;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: Function;
  topPanelComponent: any;
  sprints: number[];
  setSprints: Function;
  selectedUsers: number[];
  setSelectedUsers: Function;
  projects?: any;
  setProjects?: Function;
  sprintReportData: SprintReportDto;
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
  projects,
  setProjects,
  sprintReportData,
  selectedUsers,
  setSelectedUsers,
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
            projects,
            setProjects,
            selectedUsers,
            setSelectedUsers,
          }}
          userList={sprintReportData?.columns}
        />
        <Spin className="custom-spin" spinning={isLoading}>
          {
            <div className="flex w-full justify-start  overflow-auto">
              {children}
            </div>
          }
        </Spin>
      </div>
    </div>
  );
};

export default ReportWrapper;
