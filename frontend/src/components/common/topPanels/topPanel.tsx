import { Input, MenuProps } from "antd";
import { debounce } from "lodash";
import { SearchParamsModel } from "models/apiParams";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";

import SearchIconSvg from "@/assets/svg/searchIconSvg";
import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import SourceSelectorComponent from "./components/dataSouceSelector";
import MoreButtonTopPanel from "./components/moreButtonTopPanel";
import PrioritySelectorComponent from "./components/prioritySelector";
import ProjectSelectorComponent from "./components/projectSelector";
import SprintSelectorComponent from "./components/sprintSelector";
import StatusSelectorComponent from "./components/statusSelector";
import TopBarMoreComponent from "./components/topBarMoreComponent";
import CalendarSelectorComponent from "./components/calendarSelector";

type Props = {
  tasks: TaskDto[];
  activeSprintTasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  setSearchParams: Function;
  searchParams: SearchParamsModel;
  checkedOptionList: string[];
  setCheckedOptionList: Function;
  selectedSource: string[];
  setSelectedSource: Function;
};
const TopPanel = ({
  tasks,
  activeSprintTasks,
  activeTab,
  setActiveTab,
  setSearchParams,
  searchParams,
  checkedOptionList,
  setCheckedOptionList,
  selectedSource,
  setSelectedSource,
}: Props) => {
  const [searchText, setSearchText] = useState(searchParams.searchText);
  const [status, setStatus] = useState<string[]>(searchParams.status);
  const [projectIds, setProjectIds] = useState<number[]>(
    searchParams.projectIds
  );
  const [priority, setPriority] = useState(searchParams.priority);
  const [sprints, setSprints] = useState(searchParams.sprints);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-week")
  );
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  const options = [
    { label: "Search", value: "Search" },
    { label: "Priority", value: "Priority" },
    { label: "Status", value: "Status" },
    { label: "Project", value: "Project" },
    { label: "Calendar", value: "Calendar" },
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
    <div className="my-5  flex w-full justify-between">
      <div className="col-span-3 flex gap-3">
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
      <div className="mt-[3px] flex h-auto max-w-[900px] gap-2">
        <div className="flex h-auto  w-full flex-wrap justify-end gap-6">
          {!(sprints?.length > 0) && activeTab !== "ActiveSprint" && (
            <DateRangePicker {...{ selectedDate, setSelectedDate }} />
          )}
          {checkedOptionList.includes("Search") && (
            <div className="w-[210px]">
              <Input
                placeholder="Search"
                prefix={<SearchIconSvg />}
                defaultValue={searchParams.searchText}
                onChange={(event) => {
                  event.persist();
                  debouncedHandleInputChange(event);
                }}
                allowClear
              />
            </div>
          )}
          {
            <SourceSelectorComponent
              {...{ selectedSource, setSelectedSource }}
            />
          }
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
          {checkedOptionList.includes("Project") &&
            selectedSource?.includes("JIRA") && (
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
          {checkedOptionList.includes("Calendar") &&
            selectedSource?.includes("OUTLOOK") && (
              <div>
                <CalendarSelectorComponent
                  key={Math.random()}
                  {...{ projectIds, setProjectIds }}
                  className="w-[210px]"
                />
              </div>
            )}
        </div>
        <MoreButtonTopPanel {...{ menuProps, dropdownOpen, setDropdownOpen }} />
      </div>
    </div>
  );
};

export default TopPanel;
