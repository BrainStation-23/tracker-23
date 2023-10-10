import { Button, Dropdown, Input, MenuProps, message } from "antd";
import { userAPI } from "APIs";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import FilterIconSvg from "@/assets/svg/filterIconSvg";
import SearchIconSvg from "@/assets/svg/searchIconSvg";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import PrioritySelectorComponent from "@/components/tasks/components/topPanel/components/prioritySelector";
import ProjectSelectorComponent from "@/components/tasks/components/topPanel/components/projectSelector";
import SprintSelectorComponent from "@/components/tasks/components/topPanel/components/sprintSelector";
import StatusSelectorComponent from "@/components/tasks/components/topPanel/components/statusSelector";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  tasks: TaskDto[];
  setSearchParams: Function;
};
const TopPanelExportPage = ({ tasks, setSearchParams }: Props) => {
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-week")
  );
  const [searchText, setSearchText] = useState("");
  const [downloading, setDownloading] = useState<boolean>(false);
  const [status, setStatus] = useState([]);
  const [priority, setPriority] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [projectIds, setProjectIds] = useState<number[]>();
  const [active, setActive] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  // const handleOnClick = () => {};
  const debouncedHandleInputChange = debounce(handleInputChange, 500);
  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportTasks({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
        sprints: sprints,
        projectIds: projectIds,
      });
      console.log(
        "🚀 ~ file: topPanelExportPage.tsx:54 ~ excelExport ~ res:",
        res
      );
      if (!res) {
        message.error(
          res?.error?.message ? res?.error?.message : "Export Failed"
        );
      } else {
        const blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = `Tracker 23 Report - ${dayjs()}.xlsx`;
        link.setAttribute("download", fileName); // Specify the desired file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success("Exported to " + fileName);
        // Use FileSaver.js to save the Blob as a file
        // saveAs(blob, "exported_data.xlsx");
      }
    } catch (error) {
      message.error("Export Failed");
    }
    setDownloading(false);
  };

  const filterOptions = [
    // {
    //   icon: <SortNameIconSvg />,
    //   title: "Name",
    // },
    <PrioritySelectorComponent
      key={Math.random()}
      {...{ priority, setPriority }}
    />,
    <StatusSelectorComponent key={Math.random()} {...{ status, setStatus }} />,
    <ProjectSelectorComponent
      key={Math.random()}
      {...{ projectIds, setProjectIds }}
    />,
    // {
    //   icon: <ClockIconSvg />,
    //   title: "Estimation",
    // },
    // {
    //   icon: <SortPriorityIconSvg />,
    //   title: "Progress",
    // },
  ];
  if (sprintList.length > 0)
    filterOptions.push(
      <SprintSelectorComponent {...{ sprints, setSprints }} />
    );
  useEffect(() => {
    setSearchParams({
      searchText: searchText,
      selectedDate: selectedDate,
      priority: priority,
      status: status,
      sprints: sprints,
      projectIds: projectIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedDate, priority, status, sprints, projectIds]);
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
      <div>
        {!(sprints?.length > 0) && <DateRangePicker {...{ setSelectedDate }} />}
      </div>
      <div className="flex gap-8">
        <Input
          placeholder="Search"
          prefix={<SearchIconSvg />}
          onChange={(event) => {
            event.persist();
            debouncedHandleInputChange(event);
          }}
          allowClear
        />
        <div
          className="flex items-center gap-3"
          onMouseLeave={() => {
            setActive("");
          }}
        >
          {/* <div
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
          </div> */}
          <div
            className={`relative flex cursor-pointer gap-2 text-[#00A3DE] ${
              active === "Filter" ? "" : "grayscale"
            }`}
            style={{
              color: active === "Filter" ? "#00A3DE" : "black",
              // backgroundColor: "#00A3DE",
            }}
          >
            <Dropdown
              menu={menuProps}
              placement="bottomRight"
              open={dropdownOpen}
              onOpenChange={(open) => {
                setDropdownOpen(open);
              }}
              trigger={["click"]}
              className="transition-all delay-1000 duration-1000"
              overlayClassName="duration-1000 delay-1000 transition-all w-[300px]"
            >
              <div
                className="flex"
                // onClick={() =>
                //   active === "Filter" ? setActive("") : setActive("Filter")
                // }
              >
                <FilterIconSvg />
                <span className="font-normal">Filter</span>
              </div>
            </Dropdown>

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
              {filterOptions?.map((option) => option)}
            </div>
          </div>
        </div>
        {/* <div
          className="flex w-[320px] cursor-pointer items-center gap-2 rounded-md bg-[#016C37] p-2 text-white hover:bg-[#1F9B60]"
          onClick={() => excelExport()}
        >
          <DownloadOutlined />
          Export to Excel
        </div> */}
        <Button
          type="ghost"
          className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
          icon={<LuDownload className="text-xl" />}
          loading={downloading}
          onClick={() => excelExport()}
        >
          Export to Excel
        </Button>
      </div>
    </div>
  );
};

export default TopPanelExportPage;
