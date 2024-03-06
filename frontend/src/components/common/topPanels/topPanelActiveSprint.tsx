import { Input, MenuProps } from "antd";
import { debounce } from "lodash";
import { SearchParamsModel } from "models/apiParams";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";

import SearchIconSvg from "@/assets/svg/searchIconSvg";
import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import DateRangePicker, {
  getDateRangeArray,
} from "@/components/common/datePicker";

import PrioritySelectorComponent from "./components/prioritySelector";
import ProjectSelectorComponent from "./components/projectSelector";
import StatusSelectorComponent from "./components/statusSelector";
import TopBarMoreComponent from "./components/topBarMoreComponent";
import MoreButtonTopPanel from "./components/moreButtonTopPanel";
import { FilterDateType } from "models/reports";

type Props = {
  tasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  checkedOptionList: string[];
  activeSprintTasks: TaskDto[];
  setCheckedOptionList: Function;
  setSearchParamsActiveSprint: Function;
  searchParamsActiveSprint: SearchParamsModel;
};
const TopPanelActiveSprint = ({
  tasks,
  activeTab,
  setActiveTab,
  activeSprintTasks,
  checkedOptionList,
  setCheckedOptionList,
  searchParamsActiveSprint,
  setSearchParamsActiveSprint,
}: Props) => {
  const [searchText, setSearchText] = useState(
    searchParamsActiveSprint.searchText
  );
  const [status, setStatus] = useState<string[]>(
    searchParamsActiveSprint.status
  );
  const [projectIds, setProjectIds] = useState<number[]>(
    searchParamsActiveSprint.projectIds
  );
  const [priority, setPriority] = useState(searchParamsActiveSprint.priority);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray(FilterDateType.THIS_WEEK)
  );
  const options = [
    { label: "Search", value: "Search" },
    { label: "Priority", value: "Priority" },
    { label: "Status", value: "Status" },
    { label: "Project", value: "Project" },
  ];
  const totalPinned = tasks?.filter((task) => task.pinned)?.length;
  const tabs = ["All", "Pin", "ActiveSprint"];
  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const debouncedHandleInputChange = debounce(handleInputChange, 500);

  useEffect(() => {
    if (
      JSON.stringify(searchParamsActiveSprint) !==
      JSON.stringify({
        searchText: searchText,
        priority: priority,
        status: status,
        projectIds: projectIds,
      })
    ) {
      setSearchParamsActiveSprint({
        searchText: searchText,
        priority: priority,
        status: status,
        projectIds: projectIds,
      });
    }
  }, [searchText]);

  useEffect(() => {
    if (
      JSON.stringify(searchParamsActiveSprint) !=
        JSON.stringify({
          searchText: searchText,
          priority: priority,
          status: status,
          projectIds: projectIds,
        }) ||
      JSON.stringify(searchParamsActiveSprint.projectIds) !=
        JSON.stringify(projectIds)
    ) {
      setSearchParamsActiveSprint({
        searchText: searchText,
        priority: priority,
        status: status,
        projectIds: projectIds,
      });
    }
  }, [selectedDate, priority, status, projectIds]);
  const filterOptions = [
    <TopBarMoreComponent
      key={1}
      {...{ checkedOptionList, setCheckedOptionList, options }}
    />,
  ];
  const items: MenuProps["items"] = filterOptions.map((option, index) => {
    return {
      label: option,
      key: index,
    };
  });
  const menuProps = {
    items,
    // onClick: (item: any) => {},
  };
  return (
    <div className="my-5 flex w-full justify-between">
      <div className="flex gap-2">
        {tabs?.map((tab, index) => {
          return activeTab === tab ? (
            <MyActiveTab {...{ tab, setActiveTab }} key={index}>
              {tab === "Pin"
                ? totalPinned
                : tab === "ActiveSprint"
                ? activeSprintTasks?.length
                : tasks?.length}
            </MyActiveTab>
          ) : (
            <MyInactiveTab {...{ tab, setActiveTab }} key={index}>
              {tab === "Pin"
                ? totalPinned
                : tab === "ActiveSprint"
                ? activeSprintTasks?.length
                : tasks?.length}
            </MyInactiveTab>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex w-full flex-wrap justify-end gap-4">
          {activeTab !== "ActiveSprint" && (
            <DateRangePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
          {checkedOptionList.includes("Search") && (
            <div className="w-[210px]">
              <Input
                placeholder="Search"
                prefix={<SearchIconSvg />}
                defaultValue={searchParamsActiveSprint.searchText}
                onChange={(event) => {
                  event.persist();
                  debouncedHandleInputChange(event);
                }}
                allowClear
              />
            </div>
          )}
          {checkedOptionList.includes("Priority") && (
            <div>
              <PrioritySelectorComponent
                key={Math.random()}
                {...{ priority, setPriority }}
                className="w-[210px]"
              />
            </div>
          )}
          {checkedOptionList.includes("Status") && (
            <div>
              <StatusSelectorComponent
                key={Math.random()}
                {...{ status, setStatus }}
                className="w-[210px]"
              />
            </div>
          )}
          {checkedOptionList.includes("Project") && (
            <div>
              <ProjectSelectorComponent
                key={Math.random()}
                {...{ projectIds, setProjectIds }}
                className="w-[210px]"
              />
            </div>
          )}
        </div>
        <div className="">
          <MoreButtonTopPanel
            {...{ menuProps, dropdownOpen, setDropdownOpen }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopPanelActiveSprint;
