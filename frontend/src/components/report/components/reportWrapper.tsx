import { Spin } from "antd";
import { SprintReportDto, SprintUser } from "models/reports";

import TopPanelReportPage from "./topPanelReportPage";

type Props = {
  children: any;
  title: string;
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
  users: SprintUser[];
};
const ReportWrapper = ({
  children,
  title,
  isLoading = false,
  activeTab,
  setActiveTab,
  topPanelComponent,
  sprints,
  setSprints,
  projects,
  setProjects,
  selectedUsers,
  setSelectedUsers,
  users,
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
          userList={users}
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
