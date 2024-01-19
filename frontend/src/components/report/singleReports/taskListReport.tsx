import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { SprintUser } from "models/reports";
import { TaskDto } from "models/tasks";
import React, { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import UserSelectorComponent from "@/components/common/topPanels/components/userSelector";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { ExcelExport } from "@/services/exportHelpers";
import { getFormattedTasks } from "@/services/taskActions";
import { ReportData, updateReportSlice } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import TaskListReportComponent from "../components/taskListReportComponent";
import TopPanelTaskListComponents from "../components/topPanelTaskListComponents";
import TypeDependentSection from "../components/typeDependentSection";

type Props = {
  reportData: ReportData;
};

export default function TaskListReport({ reportData }: Props) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>(
    reportData?.config?.types ?? []
  );
  const [sprints, setSprints] = useState<number[]>(
    reportData?.config?.sprintIds ?? []
  );
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ?? []
  );
  const [calendarIds, setCalendarIds] = useState<number[]>(
    reportData?.config?.calendarIds ? reportData?.config?.calendarIds : []
  );
  const [selectedUser, setSelectedUser] = useState<number>(
    reportData?.config?.userIds?.length > 0
      ? reportData?.config?.userIds[0]
      : null
  );
  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray("this-week")
  );
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
      calendarIds,
      userIds: selectedUser ? [selectedUser] : [],
      types: selectedSource,
    });
    if (res) {
      const { formattedTasks } = getFormattedTasks(res);
      setTasks(formattedTasks || []);
    }
    setIsLoading(false);
  };
  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      startDate: dateRange[0],
      endDate: dateRange[1],
      sprintIds: sprints,
      projectIds: projects,
      calendarIds,
      userIds: selectedUser ? [selectedUser] : [],
      types: selectedSource,
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
    }
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
    calendarIds,
  ]);
  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };
  useEffect(() => {
    getUserListByProject();
  }, [projects]);
  return (
    <>
      <ReportHeaderComponent
        title={reportData.name}
        reportData={reportData}
        setIsLoading={setIsLoading}
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
        saveCofigButton={
          <PrimaryButton onClick={() => saveConfig()}> Save</PrimaryButton>
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
    </>
  );
}
