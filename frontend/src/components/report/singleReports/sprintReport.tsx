import { Button, Spin, message } from "antd";
import { userAPI } from "APIs";
import { SprintReportDto, SprintReportTask } from "models/reports";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import { getDateRangeArray } from "@/components/common/datePicker";
import { ReportData } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import SprintReportComponent from "../components/sprintReportComponents";
import ReportConfigDescription from "../components/reportSettings/components/reportConfigDescription";
import { ExcelExport } from "@/services/exportHelpers";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};
const SprintReport = ({ reportData, inView }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sprintReportData, setSprintReportData] = useState<SprintReportDto>();
  const [downloading, setDownloading] = useState<boolean>(false);

  const dateRange =
    reportData?.config?.startDate && reportData?.config?.endDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType);

  const getSprintReport = async () => {
    if (!inView) return;
    setIsLoading(true);
    if (reportData?.config?.sprintIds?.length > 0) {
      const res = await userAPI.getSprintReport({
        sprintId: reportData?.config?.sprintIds[0],
        startDate: dateRange[0],
        endDate: dateRange[1],
      });
      if (res) {
        // TODO: We will do some front-end filtering here to show or hide unworked tasks for now. Later, this will be done from backend.
        if (reportData?.config?.excludeUnworkedTasks) {
          res.data.forEach((dateData, _) => {
            dateData.users.forEach((reportUser, _) => {
              const assignedTasks: SprintReportTask[] = [];
              reportUser.assignedTasks.forEach((assignedTask) => {
                if (
                  reportUser.yesterdayTasks.find(
                    (item) => item.key === assignedTask.key
                  ) ||
                  reportUser.todayTasks.find(
                    (item) => item.key === assignedTask.key
                  )
                ) {
                  assignedTasks.push(assignedTask);
                }
              });
              reportUser.assignedTasks = assignedTasks;
            });
          });
        }
        setSprintReportData(res);
        if (window.gtag) {
          window.gtag("event", "download_report", {
            value: "Sprint Report",
          });
        }
      }
    }
    setIsLoading(false);
  };

  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportSprintViewSheet(reportData);
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
    getSprintReport();
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
        <SprintReportComponent
          data={sprintReportData}
          reportData={reportData}
        />
      </Spin>
    </>
  );
};

export default SprintReport;
