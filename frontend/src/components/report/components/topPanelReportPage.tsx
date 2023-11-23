import { MenuProps } from "antd";
import { SearchParamsModel } from "models/apiParams";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";

import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import SprintSelectorComponent from "@/components/tasks/components/topPanel/components/sprintSelector";

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

  const tabs = ["Time Sheet", "Sprint Estimate"];

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
    <div className="my-5  flex w-full justify-between">
      <div className="col-span-3 flex gap-3">
        {tabs?.map((tab) => {
          return activeTab === tab ? (
            <MyActiveTab {...{ tab, setActiveTab }}></MyActiveTab>
          ) : (
            <MyInactiveTab {...{ tab, setActiveTab }}></MyInactiveTab>
          );
        })}
      </div>
      <div className="mt-[3px] flex h-auto max-w-[900px] gap-2">
        <div className="flex h-auto  w-full flex-wrap justify-end gap-6">
          {topPanelComponent}
          {activeTab === "Sprint Estimate" && (
            <div>
              {(sprintList.length > 0 || true) && (
                <SprintSelectorComponent
                  {...{ sprints, setSprints }}
                  className="w-[210px]"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPanelReportPage;
