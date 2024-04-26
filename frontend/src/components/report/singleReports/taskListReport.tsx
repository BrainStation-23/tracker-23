import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { TaskDto } from "models/tasks";
import React, { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import { getDateRangeArray } from "@/components/common/datePicker";
import { ExcelExport } from "@/services/exportHelpers";
import { getFormattedTasks } from "@/services/taskActions";
import { ReportData } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import TaskListReportComponent from "../components/taskListReportComponent";
import TopPanelTaskListComponents from "../components/topPanelTaskListComponents";
import ReportConfigDescription from "../components/reportSettings/components/reportConfigDescription";
import { useMediaQuery } from "react-responsive";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};

export default function TaskListReport({ reportData, inView }: Props) {
  const dateRange =
    reportData?.config?.startDate && reportData?.config?.endDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType);

  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [downloading, setDownloading] = useState<boolean>(false);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const getTaskListReport = async () => {
    if (!inView) return;
    setIsLoading(true);
    const res = await userAPI.getTaskListReport({
      searchText,
      selectedDate: reportData?.config?.startDate
        ? [reportData?.config?.startDate, reportData?.config?.endDate]
        : dateRange,
      sprints: reportData?.config?.sprintIds
        ? reportData?.config?.sprintIds
        : [],
      types: reportData?.config?.types ?? [],
      projectIds: reportData?.config?.projectIds
        ? reportData?.config?.projectIds
        : [],
      userIds: reportData?.config?.userIds ? reportData?.config?.userIds : [],
      calendarIds: reportData?.config?.calendarIds
        ? reportData?.config?.calendarIds
        : [],
    });
    if (res) {
      const { formattedTasks } = getFormattedTasks(res);
      setTasks(formattedTasks || []);
      if (window.gtag) {
        window.gtag("event", "download_report", {
          value: "Task List Report",
        });
      }
    }
    setIsLoading(false);
  };
  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportTasks({
        searchText,
        selectedDate: reportData?.config?.startDate
          ? [reportData?.config?.startDate, reportData?.config?.endDate]
          : dateRange,
        sprints: reportData?.config?.sprintIds
          ? reportData?.config?.sprintIds
          : [],
        types: reportData?.config?.types ?? [],
        projectIds: reportData?.config?.projectIds
          ? reportData?.config?.projectIds
          : [],
        userIds: reportData?.config?.userIds ? reportData?.config?.userIds : [],
        calendarIds: reportData?.config?.calendarIds
          ? reportData?.config?.calendarIds
          : [],
      });
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
  }, [reportData?.config, searchText, inView]);
  return (
    <>
      <ReportHeaderComponent
        title={reportData.name}
        reportData={reportData}
        setIsLoading={setIsLoading}
        exportButton={
          <Button
            style={{
              backgroundColor: "#1d8b56",
              color: "white",
              border: "none",
            }}
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            icon={<LuDownload className="text-xl" />}
            loading={downloading}
            onClick={excelExport}
          >
            {!isMobile && "Export to Excel"}
          </Button>
        }
        extraFilterComponent={
          <>
            <TopPanelTaskListComponents
              {...{
                setSearchText,
              }}
            />
            <ReportConfigDescription reportData={reportData} />
          </>
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <TaskListReportComponent {...{ tasks, reportData }} />
      </Spin>
    </>
  );
}
