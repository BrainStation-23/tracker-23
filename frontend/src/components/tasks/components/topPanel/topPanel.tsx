import FilterIconSvg from "@/assets/svg/filterIconSvg";
import SearchIconSvg from "@/assets/svg/searchIconSvg";
import SortIconSvg from "@/assets/svg/sortIconSvg";
import { Input, Select } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { useEffect } from "react";
import StatusSelectorComponent from "./components/statusSelector";
import PrioritySelectorComponent from "./components/prioritySelector";
import { debounce } from "lodash";

type Props = {
  tasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
  setSearchParams: Function;
  searchParams: {
    searchText: string;
    selectedDate: any;
    priority: string[];
    status: string[];
  };
};
const TopPanel = ({
  tasks,
  activeTab,
  setActiveTab,
  setSearchParams,
  searchParams,
}: Props) => {
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(["TODO", "IN_PROGRESS"]);
  const [priority, setPriority] = useState([]);
  const [active, setActive] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-week")
  );
  const totalPinned = tasks?.filter((task) => task.pinned)?.length;
  const tabs = ["All", "Pin"];
  const activeButton = (tab: string, setActiveTab: Function) => (
    <div
      key={Math.random()}
      className="flex cursor-pointer items-center gap-2 p-[11px]"
      style={{
        // background: "#00A3DE",
        border: "1px solid #00A3DE",
        borderRadius: "8px",
      }}
    >
      <div
        className="px-1 text-xs font-medium text-white"
        style={{
          background: "#00A3DE",
          borderRadius: "4px",
          color: "white",
        }}
      >
        {tab === tabs[1] ? totalPinned : tasks?.length}
      </div>
      <div className="text-[15px]">{tab}</div>
    </div>
  );

  const inactiveButton = (tab: string, setActiveTab: Function) => (
    <div
      key={Math.random()}
      className="flex cursor-pointer items-center gap-2 p-[11px]"
      style={{
        // background: "#00A3DE",
        border: "1px solid #ECECED",
        borderRadius: "8px",
      }}
      onClick={() => setActiveTab(tab)}
    >
      <div
        className="px-1 text-xs font-medium text-white"
        style={{
          background: "#E7E7E7",
          borderRadius: "4px",
          color: "black",
        }}
      >
        {tab === tabs[1] ? totalPinned : tasks?.length}
      </div>
      <div className="text-[15px] text-[#4D4E55]">{tab}</div>
    </div>
  );

  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const debouncedHandleInputChange = debounce(handleInputChange, 500);
  useEffect(() => {
    setSearchParams({
      searchText: searchText,
      selectedDate: selectedDate,
      priority: priority,
      status: status,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);
  useEffect(() => {
    if (
      JSON.stringify(searchParams.priority) != JSON.stringify(priority) ||
      JSON.stringify(searchParams.selectedDate) !=
        JSON.stringify(selectedDate) ||
      JSON.stringify(searchParams.status) != JSON.stringify(status)
    ) {
      setSearchParams({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, priority, status]);
  const sortOptions = [
    // {
    //   icon: <SortNameIconSvg />,
    //   title: "Name",
    // },
    <PrioritySelectorComponent
      key={Math.random()}
      {...{ priority, setPriority }}
    />,
    <StatusSelectorComponent key={Math.random()} {...{ status, setStatus }} />,
    // {
    //   icon: <ClockIconSvg />,
    //   title: "Estimation",
    // },
    // {
    //   icon: <SortPriorityIconSvg />,
    //   title: "Progress",
    // },
  ];
  return (
    <div className="my-5 flex w-full justify-between">
      <div className="flex gap-3">
        {tabs?.map((tab) => {
          return activeTab === tab
            ? activeButton(tab, setActiveTab)
            : inactiveButton(tab, setActiveTab);
        })}
      </div>
      <div className="flex items-center gap-12">
        <DateRangePicker {...{ setSelectedDate }} />
        <Input
          placeholder="Search"
          prefix={<SearchIconSvg />}
          onChange={(event) => {
            event.persist();
            debouncedHandleInputChange(event);
          }}
          // onChange={(e) => {
          //   setSearchText(e.target.value);
          //   // debouncedSetSearchParams();
          // }}
          allowClear
        />
        <div
          className="flex items-center gap-3"
          onMouseLeave={() => {
            setActive("");
          }}
        >
          <div
            className={`flex cursor-pointer gap-2 text-[#00A3DE] ${
              active === "Sort" ? "" : "grayscale"
            }`}
            style={{
              color: active === "Sort" ? "#00A3DE" : "black",
              // backgroundColor: "#00A3DE",
            }}
            onClick={() => ("Sort" ? setActive("") : setActive("Sort"))}
          >
            <SortIconSvg />
            <span className="font-normal">Sort</span>
          </div>

          <div
            className={`relative flex cursor-pointer gap-2 text-[#00A3DE] ${
              active === "Filter" ? "" : "grayscale"
            }`}
            style={{
              color: active === "Filter" ? "#00A3DE" : "black",
              // backgroundColor: "#00A3DE",
            }}
          >
            <div
              className="flex"
              onClick={() =>
                active === "Filter" ? setActive("") : setActive("Filter")
              }
            >
              <FilterIconSvg />
              <span className="font-normal">Filter</span>
            </div>
            <div
              className={`${active === "Filter" ? "duration-500" : "hidden h-0"}
              absolute  top-[25px] right-0 z-50 flex
              w-[320px] flex-col gap-2 p-6`}
              style={{
                background: "#FFFFFF",
                boxShadow:
                  "0px 2px 6px rgba(24, 24, 28, 0.08), 0px 41px 32px -23px rgba(24, 24, 28, 0.06)",
                borderRadius: "12px",
              }}
            >
              {sortOptions?.map((option) => option)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPanel;
