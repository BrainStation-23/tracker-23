import { message } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import {
  ReportPageTabs,
  SprintReportDto,
  SprintUser,
  SprintUserReportDto,
} from "models/reports";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { ExcelExport } from "@/services/exportHelpers";
import {
  formatDate,
  getFormattedTime,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import {
  setReportProjectsSlice,
  setReportSprintListReducer,
} from "@/storage/redux/projectsSlice";

import DateRangePicker, { getDateRangeArray } from "../datePicker";
import ReportWrapper from "./components/reportWrapper";
import SpritEstimateReportComponent from "./components/sprintEstimateReportComponent";
import SprintReportComponent from "./components/sprintReportComponents";
import TableComponent from "./components/tableComponentReport";
import TaskListReportComponent from "./components/taskListReportComponent";
import TopPanelSprintReportComponents from "./components/topPanelSprintReportComponents";
import TopPanelTaskListComponents from "./components/topPanelTaskListComponents";
import TypeDependentSection from "./components/typeDependentSection";

const ReportComponent = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [SprintReportFecthedOnce, setSprintReportFecthedOnce] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [sprintUserReportData, setSprintUserReportData] =
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
  const getReport = async () => {
    setIsLoading(true);
    const res = await userAPI.getTimeSheetReport({
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: selectedUsers,
      projectIds: projects,
    });
    res.columns && setColumns(res.columns);

    res.rows && setData(res.rows);
    setDateRangeArray(res.dateRange);
    // setData(formatUserData(res));
    setIsLoading(false);
  };
  const getProjectWiseStatues = async () => {
    {
      const res = await userAPI.getAllReportProjects();
      res && dispatch(setReportProjectsSlice(res));
    }
  };

  const conponentToRender = () => {
    switch (activeTab) {
      case "Time Sheet":
        return (
          <TableComponent
            data={data}
            dateRangeArray={dateRangeArray}
            column={column}
          />
        );
      case "Sprint Estimate":
        return <SpritEstimateReportComponent data={sprintUserReportData} />;
      case "Task List":
        return <TaskListReportComponent {...{ tasks }} />;
      case "Sprint Report":
        return <SprintReportComponent data={sprintReportData} />;
      default:
        return <></>;
    }
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
          projectIds: projects,
          userIds: [selectedUser],
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
          projectIds: projects,
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
  const getSprintList = async () => {
    const res = await userAPI.getReportSprints();
    if (res?.length > 0) dispatch(setReportSprintListReducer(res));
  };
  const getSprintUserReport = async () => {
    setIsLoading(true);
    const res: SprintUserReportDto = await userAPI.getSprintUserReport({
      sprints,
      selectedUsers,
      projectIds: projects,
    });
    res && setSprintUserReportData(res);
    setIsLoading(false);
  };
  const getSprintReport = async () => {
    if (!(sprintReportSprintId && dateRange[0] && dateRange[0])) {
      setSprintReportData(null);
      return;
    }
    setIsLoading(true);
    const res = await userAPI.getSprintReport({
      sprintId: sprintReportSprintId,
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    res && setSprintReportData(res);
    res && setSprintReportFecthedOnce(true);
    setIsLoading(false);
  };

  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };
  const getTaskListReport = async () => {
    setIsLoading(true);
    const res = await userAPI.getTaskListReport({
      searchText,
      selectedDate: dateRange,
      priority,
      status,
      sprints,
      projectIds: projects,
      userIds: [selectedUser],
    });
    const tmpTasks = res?.map((task: TaskDto) => {
      const started = task.sessions[0]
        ? getFormattedTime(formatDate(task.sessions[0].startTime))
        : "Not Started";
      const ended = task.sessions[task.sessions.length - 1]?.endTime
        ? getFormattedTime(
            formatDate(task.sessions[task.sessions.length - 1].endTime)
          )
        : task.sessions[0]
        ? "Running"
        : "Not Started";
      const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
      return {
        ...task,
        startTime: formatDate(task.sessions[0]?.startTime),
        endTime: formatDate(task.sessions[task.sessions.length - 1]?.endTime),
        started: started,
        ended: ended,
        total: total,
        totalSpent: getTotalSpentTime(task.sessions),
      };
    });
    setTasks(tmpTasks || []);
    setIsLoading(false);
  };

  useEffect(() => {
    getReport();
  }, [dateRange, selectedUsers, projects]);

  useEffect(() => {
    getSprintUserReport();
  }, [sprints, selectedUsers, projects]);
  useEffect(() => {
    getUserListByProject();
  }, [projects]);
  useEffect(() => {
    getSprintList();
    getProjectWiseStatues();
  }, []);
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
  ]);

  useEffect(() => {
    activeTab === "Sprint Report" && getSprintReport();
  }, [sprintReportSprintId, dateRange]);
  useEffect(() => {
    activeTab === "Sprint Report" &&
      !SprintReportFecthedOnce &&
      getSprintReport();
  }, [activeTab]);
  return (
    <div>
      <ReportWrapper
        title="Time Reports"
        {...{
          setDateRange,
          dateRange,
          isLoading,
          activeTab,
          setActiveTab,
          sprints,
          setSprints,
          projects,
          setProjects,
          sprintUserReportData,
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
            {activeTab === "Sprint Report" && (
              <TopPanelSprintReportComponents
                {...{
                  sprint: sprintReportSprintId,
                  setSprint: setSprintReportSprintId,
                  project: projectSprintReport,
                  setProject: setProjectSprintReport,
                }}
              />
            )}
          </>
        }
      >
        {conponentToRender()}
      </ReportWrapper>
    </div>
  );
};

export default ReportComponent;
