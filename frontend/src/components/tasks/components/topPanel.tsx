import FilterIconSvg from "@/assets/svg/filterIconSvg";
import SearchIconSvg from "@/assets/svg/searchIconSvg";
import ClockIconSvg from "@/assets/svg/sortIcons/ClockIconSvg";
import SortPriorityIconSvg from "@/assets/svg/sortIcons/SortPriorityIconSvg";
import SortIconSvg from "@/assets/svg/sortIconSvg";
import { Input } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
import SortNameIconSvg from "../../../assets/svg/sortIcons/SortNameIconSvg";
import SortStatusIconSvg from "../../../assets/svg/sortIcons/SortStatusIconSvg";
import SortProgressIconSvg from "../../../assets/svg/sortIcons/SortProgressIconSvg";
import DateRangePicker from "@/components/datePicker";

const { Search } = Input;

type Props = {
  tasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
};
const TopPanel = ({ tasks, activeTab, setActiveTab }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [active, setActive] = useState("");
  const totalPinned = tasks?.filter((task) => task.pinned)?.length;
  const tabs = ["All", "Pin"];
  const activeButton = (tab: string, setActiveTab: Function) => (
    <div
      className="flex items-center gap-2 p-[11px]"
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
      className="flex items-center gap-2 p-[11px]"
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
  // const handleOnClick = () => {};

  const sortOptions = [
    // {
    //   icon: <SortNameIconSvg />,
    //   title: "Name",
    // },
    <div
      key={Math.random()}
      className={`flex w-full items-center gap-2 text-sm font-normal text-black `}
      // style={{
      //   color: active === "Sort" ? "#00A3DE" : "black",
      //   // backgroundColor: "#00A3DE",
      // }}
      // onClick={() => setActive("Sort")}
    >
      <SortProgressIconSvg />
      <span className="font-normal">Priority</span>
    </div>,
    <div
      key={Math.random()}
      className={`flex w-full items-center gap-2 text-sm font-normal text-black `}
      // style={{
      //   color: active === "Sort" ? "#00A3DE" : "black",
      //   // backgroundColor: "#00A3DE",
      // }}
      // onClick={() => setActive("Sort")}
    >
      <SortStatusIconSvg />
      <span className="font-normal">Status</span>
    </div>,
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
        <DateRangePicker />
        <Input
          placeholder="Search"
          prefix={<SearchIconSvg />}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
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
            onClick={() =>
              active === "Filter" ? setActive("") : setActive("Filter")
            }
          >
            <FilterIconSvg />
            <span className="font-normal">Filter</span>
            <div
              className={`${active === "Filter" ? "duration-500" : "hidden h-0"}
              absolute  top-[25px] right-0 z-50 flex
              w-[230px] flex-col gap-2 p-6`}
              style={{
                background: "#FFFFFF",
                boxShadow:
                  "0px 2px 6px rgba(24, 24, 28, 0.08), 0px 41px 32px -23px rgba(24, 24, 28, 0.06)",
                borderRadius: "12px",
              }}
            >
              {sortOptions?.map((option) => option)}
              {/* {sortOptions?.map((option) => (
                <div
                  key={Math.random()}
                  className={`flex w-full items-center gap-2 text-sm font-normal text-black `}
                  // style={{
                  //   color: active === "Sort" ? "#00A3DE" : "black",
                  //   // backgroundColor: "#00A3DE",
                  // }}
                  // onClick={() => setActive("Sort")}
                >
                  {option.icon}
                  <span className="font-normal">{option.title}</span>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPanel;
