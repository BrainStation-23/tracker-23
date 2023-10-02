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

type Props = {
  tasks: TaskDto[];
  activeSprintTasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  setSearchParamsActiveSprint: Function;
  searchParamsActiveSprint: SearchParamsModel;
};
const TopPanelActiveSprint = ({
  tasks,
  activeSprintTasks,
  activeTab,
  setActiveTab,
  setSearchParamsActiveSprint,
  searchParamsActiveSprint,
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

  const [checkedOptionList, setCheckedOptionList] = useState(["Search"]);
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
      <div className="flex gap-2">
        <div className="mt-[6px] flex h-auto w-full flex-wrap items-center justify-end gap-6">
          {activeTab !== "ActiveSprint" && (
            <DateRangePicker {...{ setSelectedDate }} />
          )}
          {checkedOptionList.includes("Search") && (
            <div className="w-[210px]">
              <Input
                placeholder="Search"
                prefix={<SearchIconSvg />}
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
        <div className="mt-[8px]">
          <Dropdown
            menu={menuProps}
            placement="bottomRight"
            open={dropdownOpen}
            onOpenChange={(open) => {
              setDropdownOpen(open);
            }}
            dropdownRender={(menu: React.ReactNode) => (
              <div className="custom-dropdown-bg float-right">{menu}</div>
            )}
            trigger={["click"]}
            className="custom-dropdown-bg h-min rounded-lg border-[1px] border-secondary p-2"
            overlayClassName="w-[210px]"
          >
            <div>
              <LuMoreVertical />
            </div>

            {/* <div className="flex">
              <FilterIconSvg />
              <div className="font-normal">More</div>
            </div> */}
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default TopPanelActiveSprint;
