import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { getFormattedTasks } from "@/services/taskActions";
import { ReportData } from "@/storage/redux/reportsSlice";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import {
  ReportPageTabs,
  SprintReportDto,
  SprintUser,
  SprintUserReportDto,
} from "models/reports";
import { TaskDto } from "models/tasks";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReportWrapper from "../components/reportWrapper";
import TypeDependentSection from "../components/typeDependentSection";
import TopPanelTaskListComponents from "../components/topPanelTaskListComponents";
import TaskListReportComponent from "../components/taskListReportComponent";
import { ExcelExport } from "@/services/exportHelpers";
import { message } from "antd";

type Props = {
  reportData: ReportData;
};
export default function TaskListReport({ reportData }: Props) {
  const dispatch = useDispatch();
  // const [isLoading, setIsLoading] = useState(false);
  const [Loaded, setLoaded]: any = useState({});
  const [SprintReportFecthedOnce, setSprintReportFecthedOnce] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [sprintEstimateReportData, setSprintEstimateReportData] =
    useState<SprintUserReportDto>();
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>();
  const [sprintReportData, setSprintReportData] = useState<SprintReportDto>();
  const [sprints, setSprints] = useState<number[]>([]);
  const [sprintReportSprintId, setSprintReportSprintId] = useState<number>();
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [projects, setProjects] = useState<number[]>([]);
  const [calendarIds, setCalendarIds] = useState<number[]>([]);
  const [projectSprintReport, setProjectSprintReport] = useState<number>();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();
  const [dateRange, setDateRange] = useState(getDateRangeArray("this-week"));

  const [dateRangeArray, setDateRangeArray] = useState([]);
  const [column, setColumns] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState([]);
  const [priority, setPriority] = useState([]);
  const [activeTab, setActiveTab] = useState<ReportPageTabs>(
    "Time Sheet"
    // "Sprint Report"
  );

  const getTaskListReport = async () => {
    // setIsLoading(true);
    Loaded["Task List"] = false;
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
    // setIsLoading(false);
    Loaded["Task List"] = true;
  };

  const excelExport = async () => {
    setDownloading(true);
    if (activeTab === "Task List") {
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
          ExcelExport({ file: res, name: "Tracker 23 TaskList Report" });
        }
      } catch (error) {
        message.error("Export Failed");
      }
    }
    if (activeTab === "Sprint Estimate") {
      try {
        const res = await userAPI.exportSprintReport({
          sprints,
          selectedUsers,
          projectIds: projects,
        });
        if (!res) {
          message.error(
            res?.error?.message ? res?.error?.message : "Export Failed"
          );
        } else {
          ExcelExport({ file: res, name: "Tracker 23 Sprint Report" });
        }
      } catch (error) {
        message.error("Export Failed");
      }
    }
    if (activeTab === "Time Sheet") {
      try {
        const res = await userAPI.exportTimeSheetReport({
          startDate: dateRange[0],
          endDate: dateRange[1],
          userIds: selectedUsers,
          types: selectedSource,
          projectIds: projects,
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
          ExcelExport({ file: res, name: "Tracker 23 Time Sheet Report" });
        }
      } catch (error) {
        message.error("Export Failed");
      }
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
      <ReportWrapper
        title="Time Reports"
        isLoading={!Loaded[activeTab]}
        {...{
          setDateRange,
          dateRange,

          activeTab,
          setActiveTab,
          sprints,
          setSprints,
          projects,
          setProjects,
          sprintEstimateReportData,
          selectedUsers,
          setSelectedUsers,
          users,
          selectedUser,
          setSelectedUser,
          downloading,
          excelExport,
        }}
        datePicker={
          <DateRangePicker
            selectedDate={dateRange}
            setSelectedDate={setDateRange}
          />
        }
        typeSelector={
          <TypeDependentSection
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
        }
        topPanelComponent={
          <>
            {activeTab === "Task List" && (
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
            )}
          </>
        }
      >
        <TaskListReportComponent {...{ tasks }} />
      </ReportWrapper>
    </div>
  );
}
