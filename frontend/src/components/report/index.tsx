import { message } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import {
  ReportPageTabs,
  SprintReportDto,
  SprintUser,
  SprintUserReportDto,
  SprintViewReportDto,
  SprintViewTimelineReportDto,
} from "models/reports";
import { TaskDto } from "models/tasks";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { ExcelExport } from "@/services/exportHelpers";
import { getFormattedTasks } from "@/services/taskActions";
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
import SprintViewReportComponent from "./components/sprintViewReportComponent";
import SprintViewTimelineReportComponent from "./components/sprintViewTimelineReportComponent";

const ReportComponent = () => {
  const dispatch = useDispatch();
  // const [isLoading, setIsLoading] = useState(false);
  const [Loaded, setLoaded]: any = useState({});
  const [SprintReportFecthedOnce, setSprintReportFecthedOnce] = useState(false);
  const [SprintViewReportFecthedOnce, setSprintViewReportFecthedOnce] =
    useState(false);
  const [
    SprintViewTimelineReportFecthedOnce,
    setSprintViewTimelineReportFecthedOnce,
  ] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [data, setData] = useState([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [sprintEstimateReportData, setSprintEstimateReportData] =
    useState<SprintUserReportDto>();
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>();
  const [sprintReportData, setSprintReportData] = useState<SprintReportDto>();
  const [sprintViewReportData, setSprintViewReportData] =
    useState<SprintViewReportDto>();
  const [sprintViewTimelineReportData, setSprintViewTimelineReportData] =
    useState<SprintViewTimelineReportDto>();
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
    // "Time Sheet",
    "Sprint View Timeline Report"
  );
  const getTimeSheetReport = async () => {
    // setIsLoading(true);
    Loaded["Time Sheet"] = false;
    const res = await userAPI.getTimeSheetReport({
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: selectedUsers,
      projectIds: projects,
      types: selectedSource,
    });
    res.columns && setColumns(res.columns);

    res.rows && setData(res.rows);
    setDateRangeArray(res.dateRange);
    // setData(formatUserData(res));
    // setIsLoading(false);
    Loaded["Time Sheet"] = true;
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
        return <SpritEstimateReportComponent data={sprintEstimateReportData} />;
      case "Task List":
        return <TaskListReportComponent {...{ tasks }} />;
      case "Sprint Report":
        return <SprintReportComponent data={sprintReportData} />;
      case "Sprint View Report":
        return <SprintViewReportComponent data={sprintViewReportData} />;
      case "Sprint View Timeline Report":
        return (
          <SprintViewTimelineReportComponent
            data={sprintViewTimelineReportData}
          />
        );
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
  const getSprintList = async () => {
    const res = await userAPI.getReportSprints();
    if (res?.length > 0) dispatch(setReportSprintListReducer(res));
  };
  const getSprintUserReport = async () => {
    // setIsLoading(true);
    Loaded["Sprint Estimate"] = false;
    const res: SprintUserReportDto = await userAPI.getSprintUserReport({
      sprints,
      selectedUsers,
      projectIds: projects,
    });
    res && setSprintEstimateReportData(res);
    // setIsLoading(false);
    Loaded["Sprint Estimate"] = true;
  };
  const getSprintReport = async () => {
    if (!(sprintReportSprintId && dateRange[0] && dateRange[0])) {
      setSprintReportData(null);
      Loaded["Sprint Report"] = true;
      return;
    }
    Loaded["Sprint Report"] = false;
    // setIsLoading(true);
    const res = await userAPI.getSprintReport({
      sprintId: sprintReportSprintId,
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    res && setSprintReportData(res);
    res && setSprintReportFecthedOnce(true);
    // setIsLoading(false);
    Loaded["Sprint Report"] = true;
  };

  const getSprintViewReport = async () => {
    if (!(sprintReportSprintId && dateRange[0] && dateRange[0])) {
      setSprintViewReportData(null);
      Loaded["Sprint View Report"] = true;
      return;
    }
    Loaded["Sprint View Report"] = false;
    // setIsLoading(true);
    const res = await userAPI.getSprintViewReport({
      sprintId: sprintReportSprintId,
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    console.log("res", res);
    res && setSprintViewReportData(res);
    res && setSprintViewReportFecthedOnce(true);
    // setIsLoading(false);
    Loaded["Sprint View Report"] = true;
  };

  const getSprintViewTimelineReport = async () => {
    if (!(sprintReportSprintId && dateRange[0] && dateRange[0])) {
      setSprintViewTimelineReportData(null);
      Loaded["Sprint View Timeline Report"] = true;
      return;
    }
    Loaded["Sprint View Timeline Report"] = false;
    // setIsLoading(true);
    const res = await userAPI.getSprintViewTimelineReport({
      sprintId: sprintReportSprintId,
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    console.log("res", res);
    res && setSprintViewTimelineReportData(res);
    res && setSprintViewTimelineReportFecthedOnce(true);
    // setIsLoading(false);
    Loaded["Sprint View Timeline Report"] = true;
  };

  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };
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

  useEffect(() => {
    getTimeSheetReport();
  }, [dateRange, selectedUsers, projects, selectedSource]);

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
    selectedSource,
  ]);

  useEffect(() => {
    activeTab === "Sprint Report" && getSprintReport();

    activeTab === "Sprint View Report" && getSprintViewReport();
    activeTab === "Sprint View Timeline Report" &&
      getSprintViewTimelineReport();
  }, [sprintReportSprintId, dateRange]);
  useEffect(() => {
    activeTab === "Sprint Report" &&
      !SprintReportFecthedOnce &&
      getSprintReport();

    activeTab === "Sprint View Report" &&
      !SprintViewReportFecthedOnce &&
      getSprintViewReport();

    activeTab === "Sprint View Timeline Report" &&
      !SprintViewTimelineReportFecthedOnce &&
      getSprintViewTimelineReport();
  }, [activeTab]);
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
            {(activeTab === "Sprint Report" ||
              activeTab === "Sprint View Report" ||
              activeTab === "Sprint View Timeline Report") && (
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
