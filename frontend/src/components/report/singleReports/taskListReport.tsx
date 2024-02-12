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

type Props = {
  reportData: ReportData;
};

export default function TaskListReport({ reportData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  //@ts-ignore
  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray("this-week")
  );
  const [searchText, setSearchText] = useState("");

  const getTaskListReport = async () => {
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
  }, [reportData?.config, searchText]);
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
        extraFilterComponent={
          <TopPanelTaskListComponents
            {...{
              setSearchText,
            }}
          />
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <TaskListReportComponent {...{ tasks }} />
      </Spin>
    </>
  );
}
