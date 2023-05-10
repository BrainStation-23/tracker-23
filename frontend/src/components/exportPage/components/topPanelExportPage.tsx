import FilterIconSvg from "@/assets/svg/filterIconSvg";
import SearchIconSvg from "@/assets/svg/searchIconSvg";
import SortIconSvg from "@/assets/svg/sortIconSvg";
import { Button, Input, message } from "antd";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { DownloadOutlined } from "@ant-design/icons";
import StatusSelectorComponent from "@/components/tasks/components/topPanel/components/statusSelector";
import PrioritySelectorComponent from "@/components/tasks/components/topPanel/components/prioritySelector";
import { userAPI } from "APIs";

type Props = {
  tasks: TaskDto[];
  setSearchParams: Function;
};
const TopPanelExportPage = ({ tasks, setSearchParams }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [downloading, setDownloading] = useState<boolean>(false);
  const [status, setStatus] = useState([]);
  const [priority, setPriority] = useState([]);
  const [active, setActive] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    getDateRangeArray("this-month")
  );

  // const handleOnClick = () => {};

  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportTasks({
        searchText: searchText,
        selectedDate: selectedDate,
        priority: priority,
        status: status,
      });
      const blob = new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = "exportedData.xlsx";
      link.setAttribute("download", fileName); // Specify the desired file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("Exported to " + fileName);
      // Use FileSaver.js to save the Blob as a file
      // saveAs(blob, "exported_data.xlsx");
    } catch (error) {
      message.error("Export Failed");
    }
    setDownloading(false);
  };

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
  useEffect(() => {
    setSearchParams({
      searchText: searchText,
      selectedDate: selectedDate,
      priority: priority,
      status: status,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedDate, priority, status]);
  return (
    <div className="my-5 flex w-full justify-between">
      <div>
        <DateRangePicker {...{ setSelectedDate }} />
      </div>
      <div className="flex gap-8">
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
              absolute  top-8 right-0 z-50 flex
              w-[230px] flex-col gap-2 p-6  `}
              style={{
                /* White */

                background: "#FFFFFF",
                /* SH-2 */

                boxShadow:
                  "0px 2px 6px rgba(24, 24, 28, 0.08), 0px 41px 32px -23px rgba(24, 24, 28, 0.06)",
                borderRadius: "12px",
              }}
            >
              {sortOptions?.map((option) => option)}
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
          type="default"
          className="rounded-md bg-[#016C37] text-white hover:bg-[#1F9B60]"
          icon={<DownloadOutlined />}
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
