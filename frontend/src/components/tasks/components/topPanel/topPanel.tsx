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
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import PrioritySelectorComponent from "./components/prioritySelector";
import ProjectSelectorComponent from "./components/projectSelector";
import SprintSelectorComponent from "./components/sprintSelector";
import StatusSelectorComponent from "./components/statusSelector";
import TopBarMoreComponent from "./components/topBarMoreComponent";

type Props = {
  tasks: TaskDto[];
  activeSprintTasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  setSearchParams: Function;
  searchParams: SearchParamsModel;
};
const TopPanel = ({
  tasks,
  activeSprintTasks,
  activeTab,
  setActiveTab,
  setSearchParams,
  searchParams,
}: Props) => {
  const [searchText, setSearchText] = useState(searchParams.searchText);
  const [status, setStatus] = useState<string[]>(searchParams.status);
  const [projectIds, setProjectIds] = useState<number[]>(
    searchParams.projectIds
  );
  const [priority, setPriority] = useState(searchParams.priority);
  const [sprints, setSprints] = useState(searchParams.sprints);
  const [active, setActive] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-week")
  );
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  const [checkedOptionList, setCheckedOptionList] = useState(["Search"]);
  const options = [
    { label: "Search", value: "Search" },
    { label: "Priority", value: "Priority" },
    { label: "Status", value: "Status" },
    { label: "Project", value: "Project" },
  ];
  if (sprintList.length > 0) options.push({ label: "Sprint", value: "Sprint" });

  const totalPinned = tasks?.filter((task) => task.pinned)?.length;
  const tabs = ["All", "Pin", "ActiveSprint"];

  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const debouncedHandleInputChange = debounce(handleInputChange, 500);
  // useEffect(()=>)
  useEffect(() => {
    if (
      JSON.stringify(searchParams) !==
      JSON.stringify({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
        sprints: sprints,
        projectIds: projectIds,
      })
    ) {
      setSearchParams({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
        sprints: sprints,
        projectIds: projectIds,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);
  useEffect(() => {
    if (
      JSON.stringify(searchParams.priority) != JSON.stringify(priority) ||
      JSON.stringify(searchParams.selectedDate) !=
        JSON.stringify(selectedDate) ||
      JSON.stringify(searchParams.status) != JSON.stringify(status) ||
      JSON.stringify(searchParams.projectIds) != JSON.stringify(projectIds)
    ) {
      setSearchParams({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
        sprints: sprints,
        projectIds: projectIds,
      });
    } else if (
      JSON.stringify(sprints) != JSON.stringify(searchParams.sprints)
    ) {
      setSearchParams({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
        sprints: sprints,
        projectIds: projectIds,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, priority, status, sprints, projectIds]);

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
    <div className="my-5 grid w-full grid-cols-12">
      <div className="col-span-3 flex gap-3">
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
      <div className="col-span-1"></div>
      <div className="col-span-8 flex h-auto gap-2">
        <div className="flex h-auto  w-full flex-wrap items-center justify-end gap-6">
          {!(sprints?.length > 0) && activeTab !== "ActiveSprint" && (
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
          {checkedOptionList.includes("Sprint") && (
            <div>
              {sprintList.length > 0 && (
                <SprintSelectorComponent
                  {...{ sprints, setSprints }}
                  className="w-[210px]"
                />
              )}
            </div>
          )}
        </div>
        <div className="mt-[7px]">
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

export default TopPanel;
