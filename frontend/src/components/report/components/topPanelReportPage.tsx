import { ReportPageTabs, SprintUser } from "models/reports";
import { useEffect } from "react";

import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import UserSelectorComponent from "@/components/common/topPanels/components/userSelector";
import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";

type Props = {
  activeTab: ReportPageTabs;
  setActiveTab: Function;
  datePicker: any;
  topPanelComponent: any;
  typeSelector: any;
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
  userList,
  selectedUsers,
  setSelectedUsers,
  selectedUser,
  setSelectedUser,
  datePicker,
  typeSelector,
}: Props) => {
  const tabs = ["Time Sheet", "Sprint Estimate", "Task List", "Sprint Report"];

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPanelReportPage;
