import React, { useEffect, useState } from "react";
import { Button, Spin, message } from "antd";
import { userAPI } from "APIs";
import { SprintViewTimelineReportDto } from "models/reports";
import { LuDownload } from "react-icons/lu";

import { ReportData } from "@/storage/redux/reportsSlice";

import { getDateRangeArray } from "@/components/common/datePicker";
import ReportHeaderComponent from "../components/reportHeaderComponent";
import SprintViewTimelineReportComponent from "../components/sprintViewTimelineReportComponent";
import ReportConfigDescription from "../components/reportSettings/components/reportConfigDescription";
import { ExcelExport } from "@/services/exportHelpers";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};

export default function SprintTimelineReport({ reportData, inView }: Props) {
  const dateRange =
    reportData?.config?.startDate && reportData?.config?.endDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType);

  const [isLoading, setIsLoading] = useState(false);
  const [sprintTimelineReportData, setSprintTimelineReportData] =
    useState<SprintViewTimelineReportDto>();
  const [downloading, setDownloading] = useState<boolean>(false);

  const getSprintViewTimelineReport = async () => {
    if (!inView) return;
    if (
      !(
        reportData?.config?.sprintIds?.length > 0 &&
        reportData?.config?.sprintIds[0] &&
        dateRange[0] &&
        dateRange[1]
      )
    ) {
      setSprintTimelineReportData(null);
      return;
    }
    setIsLoading(true);
    const res = await userAPI.getSprintViewTimelineReport({
      sprintId:
        reportData?.config?.sprintIds?.length > 0
          ? reportData?.config?.sprintIds[0]
          : null,
      startDate: dateRange[0],
      endDate: dateRange[1],
      ...(reportData?.config?.excludeUnworkedTasks && {
        excludeUnworkedTasks: reportData?.config?.excludeUnworkedTasks,
      }),
    });
    if (res) {
      // TODO: We will do some front-end filtering here to show or hide unworked tasks for now. Later, this will be done from backend.
      if (reportData?.config?.excludeUnworkedTasks) {
        res.rows.forEach((row, _) => {
          const workedTaskKeys = new Set<string>([]);

          row.data.forEach((data, _) => {
            if (data.key !== "AssignTasks") {
              data.value.tasks.forEach((task, _) => {
                workedTaskKeys.add(task.key);
              });
            }
          });

          row.data.forEach((data, _) => {
            if (data.key === "AssignTasks") {
              data.value.tasks = data.value.tasks.filter((task) =>
                workedTaskKeys.has(task.key)
              );
            }
          });
        });
      }

      setSprintTimelineReportData(res);
      if (window.gtag) {
        window.gtag("event", "download_report", {
          value: "Sprint Report",
        });
      }
    }
    setIsLoading(false);
  };

  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportTimeLineSheet(reportData);
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
    getSprintViewTimelineReport();
  }, [reportData?.config, inView]);

  return (
    <>
      <ReportHeaderComponent
        title={reportData.name}
        reportData={reportData}
        setIsLoading={setIsLoading}
        exportButton={
          <Button
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            icon={<LuDownload className="text-xl" />}
            onClick={() => excelExport()}
            type="ghost"
            loading={downloading}
          >
            Export to Excel
          </Button>
        }
        extraFilterComponent={
          <ReportConfigDescription reportData={reportData} />
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <SprintViewTimelineReportComponent
          data={sprintTimelineReportData}
          reportData={reportData}
        />
      </Spin>
    </>
  );
}
