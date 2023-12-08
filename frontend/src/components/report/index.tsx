import { message } from "antd";
import { userAPI } from "APIs";
import { SprintReportDto, SprintUser } from "models/reports";
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
import { setSprintListReducer } from "@/storage/redux/tasksSlice";

import DateRangePicker, { getDateRangeArray } from "../datePicker";
import ReportWrapper from "./components/reportWrapper";
import SpritReportComponent from "./components/sprintReportComponent";
import TableComponent from "./components/tableComponentReport";
import TaskListReportComponent from "./components/taskListReportComponent";
import TopPanelTaskListComponents from "./components/topPanelTaskListComponents";

const ReportComponent = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [sprintReportData, setSprintReportData] = useState<SprintReportDto>();
  const [sprints, setSprints] = useState<number[]>([]);
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [projects, setProjects] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();
  const [dateRange, setDateRange] = useState(getDateRangeArray("this-week"));
  const [dateRangeArray, setDateRangeArray] = useState([]);
  const [column, setColumns] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState([]);
  const [priority, setPriority] = useState([]);
  const [activeTab, setActiveTab] = useState<
    "Time Sheet" | "Sprint Estimate" | "Task List"
  >("Time Sheet");
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
        console.log(
          "🚀 ~ file: topPanelExportPage.tsx:54 ~ excelExport ~ res:",
          res
        );
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
    const res = await userAPI.getJiraSprints();
    if (res?.length > 0) dispatch(setSprintListReducer(res));
  };
  const getSprintReport = async () => {
    setIsLoading(true);
    const res: SprintReportDto = await userAPI.getSprintReport({
      sprints,
      selectedUsers,
      projectIds: projects,
    });
    res && setSprintReportData(res);
    setIsLoading(false);
  };

  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
    console.log("🚀 ~ file: index.tsx:58 ~ getUserListByProject ~ res:", res);
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
        id: task.id,
        title: task?.title,
        description: task.description,
        estimation: task.estimation,
        startTime: formatDate(task.sessions[0]?.startTime),
        endTime: formatDate(task.sessions[task.sessions.length - 1]?.endTime),
        started: started,
        ended: ended,
        total: total,
        totalSpent: getTotalSpentTime(task.sessions),
        priority: task.priority,
      };
    });
    setTasks(tmpTasks || []);
    setIsLoading(false);
  };

  useEffect(() => {
    getReport();
  }, [dateRange, selectedUsers, projects]);

  useEffect(() => {
    getSprintReport();
  }, [sprints, selectedUsers, projects]);
  useEffect(() => {
    getUserListByProject();
  }, [projects]);
  useEffect(() => {
    getSprintReport();
    getSprintList();
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
          sprintReportData,
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
                  sprints,
                  setSprints,
                }}
              />
            )}
          </>
        }
      >
        {activeTab === "Time Sheet" ? (
          <TableComponent
            data={data}
            dateRangeArray={dateRangeArray}
            column={column}
          />
        ) : activeTab === "Sprint Estimate" ? (
          <SpritReportComponent data={sprintReportData} />
        ) : (
          <TaskListReportComponent {...{ tasks }} />
        )}
      </ReportWrapper>
    </div>
  );
};

export default ReportComponent;
