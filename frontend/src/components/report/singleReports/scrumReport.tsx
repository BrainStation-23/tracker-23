import { Button, Spin, message } from "antd";
import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import { getDateRangeArray } from "@/components/common/datePicker";
import { ReportData, updateReportSlice } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import ReportConfigDescription from "../components/reportSettings/components/reportConfigDescription";
import { ExcelExport } from "@/services/exportHelpers";
import { useMediaQuery } from "react-responsive";
import ScrumReportComponent from "../components/scrumReportComponent";
import { FilterDateType } from "models/reports";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};
const ScrumReport = ({ reportData, inView }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [scrumReportData, setScrumReportData] = useState<any>();
  const [downloading, setDownloading] = useState<boolean>(false);
  console.log(reportData, "reportdata from scrumReport");

  const dateRange = reportData?.config?.filterDateType ? reportData.config.filterDateType === "CUSTOM_DATE"?
  [reportData.config.startDate, reportData.config.endDate] : getDateRangeArray(reportData?.config?.filterDateType, true) :
  getDateRangeArray(FilterDateType.TODAY, true) 
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getScrumReport = async () => {
    if (!inView) return;
    setIsLoading(true);
    const res = await userAPI.getScrumReport(
      reportData?.config?.projectIds,
      dateRange[1],
    );
    console.log(res, "data from scrumReport.tsx");
    if (res) {
      setScrumReportData(res);
      if (window.gtag) {
        window.gtag("event", "download_report", {
          value: "Scrum Report",
        });
      }
    }

    setIsLoading(false);
  };

  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportScrumViewSheet(reportData);
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
    getScrumReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData.config, inView]);

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
            onClick={excelExport}
            loading={downloading}
          >
            {!isMobile && "Export to Excel"}
          </Button>
        }
        extraFilterComponent={
          <ReportConfigDescription reportData={reportData} />
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <ScrumReportComponent data={scrumReportData} reportData={reportData} />
      </Spin>
    </>
  );
};

export default ScrumReport;
