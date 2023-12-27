import { Button, Spin } from "antd";
import { ReportPageTabs, SprintUser } from "models/reports";
import { LuDownload } from "react-icons/lu";

import TopPanelReportPage from "./topPanelReportPage";

type Props = {
  children: any;
  title: string;
  isLoading: boolean;
  activeTab: ReportPageTabs;
  setActiveTab: Function;
  topPanelComponent: any;
  typeSelector: any;
  datePicker: any;
  sprints: number[];
  setSprints: Function;
  selectedUsers: number[];
  setSelectedUsers: Function;
  selectedUser: number;
  setSelectedUser: Function;
  projects?: any;
  setProjects?: Function;
  users: SprintUser[];
  downloading: boolean;
  excelExport: Function;
};
const ReportWrapper = ({
  children,
  title,
  isLoading = false,
  activeTab,
  setActiveTab,
  topPanelComponent,
  typeSelector,
  sprints,
  setSprints,
  projects,
  setProjects,
  selectedUsers,
  setSelectedUsers,
  users,
  datePicker,
  selectedUser,
  setSelectedUser,
  downloading,
  excelExport,
}: Props) => {
  return (
    <div className="mt-5">
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-semibold">{title}</div>
          <Button
            type="ghost"
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            icon={<LuDownload className="text-xl" />}
            loading={downloading}
            onClick={() => excelExport()}
          >
            Export to Excel
          </Button>
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
            datePicker,
            selectedUser,
            setSelectedUser,
            typeSelector,
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
