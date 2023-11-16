import { Dropdown, Input, MenuProps } from "antd";
import { debounce } from "lodash";
import { SearchParamsModel } from "models/apiParams";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import { LuMoreVertical } from "react-icons/lu";

import SearchIconSvg from "@/assets/svg/searchIconSvg";
import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";

import PrioritySelectorComponent from "./components/prioritySelector";
import ProjectSelectorComponent from "./components/projectSelector";
import StatusSelectorComponent from "./components/statusSelector";
import TopBarMoreComponent from "./components/topBarMoreComponent";
import MoreButtonTopPanel from "./components/moreButtonTopPanel";

type Props = {
  tasks: TaskDto[];
  activeSprintTasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  setSearchParamsActiveSprint: Function;
  searchParamsActiveSprint: SearchParamsModel;
  checkedOptionList: string[];
  setCheckedOptionList: Function;
};
const TopPanelActiveSprint = ({
  tasks,
  activeSprintTasks,
  activeTab,
  setActiveTab,
  setSearchParamsActiveSprint,
  searchParamsActiveSprint,
  checkedOptionList,
  setCheckedOptionList,
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
  const [active, setActive] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-week")
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
  // useEffect(()=>)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, priority, status, projectIds]);
  const filterOptions = [
    <TopBarMoreComponent
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
    onClick: (item: any) => {},
  };
  return (
    <div className="my-5 flex w-full justify-between">
      <div className="flex gap-3">
        {tabs?.map((tab) => {
          return activeTab === tab ? (
            <MyActiveTab {...{ tab, setActiveTab }}>
              {tab === "Pin"
                ? totalPinned
                : tab === "ActiveSprint"
                ? activeSprintTasks?.length
                : tasks?.length}
            </MyActiveTab>
          ) : (
            <MyInactiveTab {...{ tab, setActiveTab }}>
              {tab === "Pin"
                ? totalPinned
                : tab === "ActiveSprint"
                ? activeSprintTasks?.length
                : tasks?.length}
            </MyInactiveTab>
          );
        })}
      </div>
      <div className="mt-[3px] flex max-w-[900px] gap-2">
        <div className="flex h-auto w-full flex-wrap justify-end gap-6">
          {activeTab !== "ActiveSprint" && (
            <DateRangePicker {...{ selectedDate, setSelectedDate }} />
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
