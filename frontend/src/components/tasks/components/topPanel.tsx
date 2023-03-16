import { Input } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";

const { Search } = Input;

type Props = {
  tasks: TaskDto[];
  activeTab: string;
  setActiveTab: Function;
};
const TopPanel = ({ tasks, activeTab, setActiveTab }: Props) => {
  const [searchText, setSearchText] = useState("");
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

  return (
    <div className="flex w-full justify-between">
      <div className="flex gap-3">
        {tabs?.map((tab) => {
          return activeTab === tab
            ? activeButton(tab, setActiveTab)
            : inactiveButton(tab, setActiveTab);
        })}
      </div>
      <div>
        <Search
          placeholder="input search text"
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          allowClear
        />
      </div>
    </div>
  );
};

export default TopPanel;
