import { MenuProps } from "antd";
import { ReportPageTabs, SprintUser } from "models/reports";
import { useRouter } from "next/router";
import { useEffect } from "react";

import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import SourceSelectorComponent from "@/components/common/topPanels/components/dataSouceSelector";
import ProjectSelectorComponent from "@/components/common/topPanels/components/projectSelector";
import SprintSelectorComponent from "@/components/common/topPanels/components/sprintSelector";
import UserSelectorComponent from "@/components/common/topPanels/components/userSelector";
import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  activeTab: ReportPageTabs;
  setActiveTab: Function;
  projects?: any;
  setProjects?: any;
  datePicker: any;
  topPanelComponent: any;
  typeSelector: any;
  sprints: number[];
  setSprints: Function;
  userList: SprintUser[];
  selectedUsers: number[];
  setSelectedUsers: Function;
  selectedUser: number;
  setSelectedUser: Function;
};
const TopPanelReportPage = ({
  activeTab,
  setActiveTab,
  topPanelComponent,
  sprints,
  setSprints,
  projects,
  setProjects,
  userList,
  selectedUsers,
  setSelectedUsers,
  selectedUser,
  setSelectedUser,
  datePicker,
  typeSelector,
}: Props) => {
  const router = useRouter();
  const path = router.asPath;

  const sprintList = path.includes("report")
    ? useAppSelector((state: RootState) => state.projectList.reportSprintList)
    : useAppSelector((state: RootState) => state.tasksSlice.sprintList);
  const options = [
    // { label: "Search", value: "Search" },
    // { label: "Priority", value: "Priority" },
    // { label: "Status", value: "Status" },
    // { label: "Project", value: "Project" },
  ];
  if (sprintList.length > 0) options.push({ label: "Sprint", value: "Sprint" });

  const tabs = ["Time Sheet", "Sprint Estimate", "Task List", "Sprint Report"];

  const filterOptions: any = [];

  const items: MenuProps["items"] = filterOptions.map(
    (option: any, index: any) => {
      return {
        label: option,
        key: index,
      };
    }
  );
  const menuProps = {
    items,
    onClick: (item: any) => {},
  };
  useEffect(() => {}, [activeTab]);
  return (
    <div className="my-5 flex w-full justify-between">
      <div className="col-span-3 flex gap-3">
        {tabs?.map((tab, index) => {
          return activeTab === tab ? (
            <MyActiveTab {...{ tab, setActiveTab }} key={index}></MyActiveTab>
          ) : (
            <MyInactiveTab
              {...{ tab, setActiveTab }}
              key={index}
            ></MyInactiveTab>
          );
        })}
      </div>
      <div className="mt-[3px] flex h-auto max-w-[950px] gap-2">
        <div className="flex h-auto w-full flex-wrap items-center justify-end gap-6">
          {!["Sprint Estimate"].includes(activeTab) && datePicker}
          {topPanelComponent}
          {!["Sprint Estimate", "Sprint Report"].includes(activeTab) &&
            typeSelector}
          {!["Sprint Report"].includes(activeTab) && (
            <>
              {activeTab === "Task List" ? (
                <UserSelectorComponent
                  {...{ userList, selectedUser, setSelectedUser }}
                  className="w-[210px]"
                />
              ) : (
                <UsersSelectorComponent
                  {...{ userList, selectedUsers, setSelectedUsers }}
                  className="w-[210px]"
                />
              )}
              <ProjectSelectorComponent
                projectIds={projects}
                setProjectIds={setProjects}
                className="w-[210px]"
              />
              {(activeTab === "Sprint Estimate" || activeTab === "Task List") &&
                sprintList.length > 0 && (
                  <SprintSelectorComponent
                    projectIds={projects}
                    {...{ sprints, setSprints }}
                    className="w-[210px]"
                  />
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPanelReportPage;
