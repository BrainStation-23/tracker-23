import { MenuProps } from "antd";
import { SearchParamsModel } from "models/apiParams";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";

import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import ProjectSelectorComponent from "@/components/common/topPanels/components/projectSelector";
import SprintSelectorComponent from "@/components/common/topPanels/components/sprintSelector";
import UserSelectorComponent from "@/components/common/topPanels/components/userSelector";
import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  activeSprintTasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  setSearchParams: Function;
  searchParams: SearchParamsModel;
  checkedOptionList: string[];
  setCheckedOptionList: Function;
  setDateRange: any;
  dateRange: Function;
  projects?: any;
  setProjects?: any;
  datePicker: any;
};
const TopPanelReportPage = ({
  activeTab,
  setActiveTab,
  setSearchParams,
  searchParams,
  selectedDate,
  setSelectedDate,
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
}: any) => {
  //   const [selectedDate, setSelectedDate] = useState(dateRange);
  //   console.log(
  //     "🚀 ~ file: topPanelReportPage.tsx:33 ~ selectedDate:",
  //     selectedDate
  //   );
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  const options = [
    // { label: "Search", value: "Search" },
    // { label: "Priority", value: "Priority" },
    // { label: "Status", value: "Status" },
    // { label: "Project", value: "Project" },
  ];
  if (sprintList.length > 0) options.push({ label: "Sprint", value: "Sprint" });

  const tabs = ["Time Sheet", "Sprint Estimate", "Task List"];

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
          {activeTab !== "Sprint Estimate" && datePicker}
          {topPanelComponent}
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
        </div>
      </div>
    </div>
  );
};

export default TopPanelReportPage;
