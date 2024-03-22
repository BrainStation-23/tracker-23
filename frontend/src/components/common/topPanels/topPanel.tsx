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
  activeTab: string;
  setActiveTab: Function;
  setSearchParams: Function;
  checkedOptionList: string[];
  activeSprintTasks: TaskDto[];
  setCheckedOptionList: Function;
  searchParams: SearchParamsModel;
};
const TopPanel = ({
  tasks,
  activeTab,
  setActiveTab,
  searchParams,
  setSearchParams,
  activeSprintTasks,
  checkedOptionList,
  setCheckedOptionList,
}: Props) => {
  const totalPinned = tasks?.filter((task) => task.pinned)?.length;
  const tabs = ["All", "Pin"];

  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );

  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-week")
  );
  const [projectIds, setProjectIds] = useState<number[]>(
    searchParams.projectIds
  );
  const [calendarIds, setCalendarIds] = useState<number[]>(
    searchParams.calendarIds
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sprints, setSprints] = useState(searchParams.sprints);
  const [priority, setPriority] = useState(searchParams.priority);
  const [status, setStatus] = useState<string[]>(searchParams.status);
  const [searchText, setSearchText] = useState(searchParams.searchText);
  const [selectedSource, setSelectedSource] = useState(searchParams.types);
  const options = [
    { label: "Search", value: "Search" },
    { label: "Priority", value: "Priority" },
    { label: "Status", value: "Status" },
    { label: "Project", value: "Project" },
    { label: "Calendar", value: "Calendar" },
  ];
  if (sprintList.length > 0) options.push({ label: "Sprint", value: "Sprint" });

  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const debouncedHandleInputChange = debounce(handleInputChange, 500);
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
        calendarIds: calendarIds,
        types: selectedSource,
      })
    ) {
      setSearchParams({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
        sprints: sprints,
        projectIds: projectIds,
        calendarIds: calendarIds,
        types: selectedSource,
      });
    }
  }, [searchText]);
  useEffect(() => {
    if (
      JSON.stringify(searchParams.priority) != JSON.stringify(priority) ||
      JSON.stringify(searchParams.selectedDate) !=
        JSON.stringify(selectedDate) ||
      JSON.stringify(searchParams.status) != JSON.stringify(status) ||
      JSON.stringify(searchParams.projectIds) != JSON.stringify(projectIds) ||
      JSON.stringify(searchParams.calendarIds) != JSON.stringify(calendarIds) ||
      JSON.stringify(searchParams.types) != JSON.stringify(selectedSource)
    ) {
      setSearchParams({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
        sprints: sprints,
        projectIds: projectIds,
        calendarIds: calendarIds,
        types: selectedSource,
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
        calendarIds: calendarIds,
        types: selectedSource,
      });
    }
  }, [
    selectedDate,
    priority,
    status,
    sprints,
    projectIds,
    calendarIds,
    selectedSource,
  ]);

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
      <div className="flex items-center justify-end gap-2">
        <div className="flex justify-end gap-4">
          {!(sprints?.length > 0) && activeTab !== "ActiveSprint" && (
            <DateRangePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              className="min-w-[280px]"
            />
          )}
          {checkedOptionList.includes("Search") && (
            <div className="min-w-[210px]">
              <Input
                className="w-full"
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
                  {...{ calendarIds, setCalendarIds }}
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
