import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { getFormattedTasks } from "@/services/taskActions";
import { ReportData } from "@/storage/redux/reportsSlice";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { SprintUser } from "models/reports";
import { TaskDto } from "models/tasks";
import React, { useEffect, useState } from "react";
import TypeDependentSection from "../components/typeDependentSection";
import TopPanelTaskListComponents from "../components/topPanelTaskListComponents";
import TaskListReportComponent from "../components/taskListReportComponent";
import { ExcelExport } from "@/services/exportHelpers";
import { Button, Spin, message } from "antd";
import ReportHeaderComponent from "../components/reportHeaderComponent";
import UserSelectorComponent from "@/components/common/topPanels/components/userSelector";
import { LuDownload } from "react-icons/lu";

type Props = {
  reportData: ReportData;
};

export default function TaskListReport({ reportData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>(
    reportData?.config?.types ?? []
  );
  const [sprints, setSprints] = useState<number[]>(
    reportData?.config?.sprints ?? []
  );
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ?? []
  );
  const [calendarIds, setCalendarIds] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();
  const [dateRange, setDateRange] = useState(getDateRangeArray("this-week"));

  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState([]);
  const [priority, setPriority] = useState([]);
  const activeTab = "Task List";

  const getTaskListReport = async () => {
    setIsLoading(true);
    const res = await userAPI.getTaskListReport({
      searchText,
      selectedDate: dateRange,
      priority,
      status,
      sprints,
      projectIds: projects,
      userIds: selectedUser ? [selectedUser] : [],
      types: selectedSource,
    });
    if (res) {
      const { formattedTasks } = getFormattedTasks(res);
      setTasks(formattedTasks || []);
    }
    setIsLoading(false);
  };

  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportTasks({
        searchText,
        selectedDate: dateRange,
        priority,
        status,
        sprints,
        types: selectedSource,
        projectIds: projects,
        userIds: [selectedUser],
        calendarIds,
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
        ExcelExport({ file: res, name: `${reportData.name}` });
      }
    } catch (error) {
      message.error("Export Failed");
    }

    setDownloading(false);
  };

  useEffect(() => {
    getTaskListReport();
  }, [
    searchText,
    dateRange,
    priority,
    status,
    sprints,
    projects,
    selectedUser,
    selectedSource,
  ]);

  return (
    <div>
      <ReportHeaderComponent
        title={reportData.name}
        reportData={reportData}
        exportButton={
          <Button
            type="ghost"
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            icon={<LuDownload className="text-xl" />}
            loading={downloading}
            onClick={() => excelExport()}
          >
            Export to Excel
          </Button>
        }
      >
        <>
          <DateRangePicker
            selectedDate={dateRange}
            setSelectedDate={setDateRange}
          />

          <TypeDependentSection
            config={reportData?.config}
            {...{
              activeTab,
              selectedSource,
              setSelectedSource,
              projects,
              setProjects,
              sprints,
              setSprints,
              calendarIds,
              setCalendarIds,
            }}
          />
          <TopPanelTaskListComponents
            {...{
              searchText,
              setSearchText,
              status,
              setStatus,
              priority,
              setPriority,
            }}
          />

          <UserSelectorComponent
            {...{ userList: users, selectedUser, setSelectedUser }}
            className="w-[210px]"
          />
        </>
      </ReportHeaderComponent>
      <Spin className="custom-spin" spinning={isLoading}>
        <TaskListReportComponent {...{ tasks }} />
      </Spin>
    </div>
  );
}
