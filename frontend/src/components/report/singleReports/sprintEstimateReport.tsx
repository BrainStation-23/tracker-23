import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { SprintUserReportDto } from "models/reports";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import { ExcelExport } from "@/services/exportHelpers";
import { ReportData } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import SpritEstimateReportComponent from "../components/sprintEstimateReportComponent";
import ReportConfigDescription from "../components/reportSettings/components/reportConfigDescription";
import { useMediaQuery } from "react-responsive";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};
const SprintEstimateReport = ({ reportData, inView }: Props) => {
  const [sprintEstimateReportData, setSprintEstimateReportData] =
    useState<SprintUserReportDto>();
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportSprintReport({
        sprints: reportData?.config?.sprintIds
          ? reportData?.config?.sprintIds
          : [],
        selectedUsers: reportData?.config?.userIds
          ? reportData?.config?.userIds
          : [],
        projectIds: reportData?.config?.projectIds
          ? reportData?.config?.projectIds
          : [],
      });
      if (!res) {
        message.error(
          res?.error?.message ? res?.error?.message : "Export Failed"
        );
      } else {
        if (window.gtag) {
          window.gtag("event", "download_report", {
            value: "Sprint Estimation Report",
          });
        }
        ExcelExport({ file: res, name: "Tracker 23 Sprint Report" });
      }
    } catch (error) {
      message.error("Export Failed");
    }
    setDownloading(false);
  };
  const getSprintUserReport = async () => {
    if (!inView) return;
    setIsLoading(true);
    const res: SprintUserReportDto = await userAPI.getSprintUserReport({
      sprints: reportData?.config?.sprintIds
        ? reportData?.config?.sprintIds
        : [],
      selectedUsers: reportData?.config?.userIds
        ? reportData?.config?.userIds
        : [],
      projectIds: reportData?.config?.projectIds
        ? reportData?.config?.projectIds
        : [],
    });
    res && setSprintEstimateReportData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    getSprintUserReport();
  }, [reportData?.config, inView]);

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
          <ReportConfigDescription reportData={reportData} />
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <SpritEstimateReportComponent
          data={sprintEstimateReportData}
          reportData={reportData}
        />
      </Spin>
    </>
  );
};

export default SprintEstimateReport;
