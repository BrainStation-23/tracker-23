import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { Button, message, Spin } from "antd";
import { useMediaQuery } from "react-responsive";

import { ExcelExport } from "@/services/exportHelpers";
import { ReportData } from "@/storage/redux/reportsSlice";

import TableComponent from "../components/tableComponentReport";
import { getDateRangeArray } from "@/components/common/datePicker";
import ReportHeaderComponent from "../components/reportHeaderComponent";
import ReportConfigDescription from "../components/reportSettings/components/reportConfigDescription";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};
const TimeSheetReport = ({ reportData, inView }: Props) => {
  const dateRange =
    reportData?.config?.startDate && reportData?.config?.endDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType);

  const [data, setData] = useState([]);
  const [column, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRangeArray, setDateRangeArray] = useState([]);
  const [downloading, setDownloading] = useState<boolean>(false);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportTimeSheetReport({
        startDate: dateRange[0],
        endDate: dateRange[1],
        userIds: reportData?.config?.userIds ? reportData?.config?.userIds : [],
        projectIds: reportData?.config?.projectIds
          ? reportData?.config?.projectIds
          : [],
        calendarIds: reportData?.config?.calendarIds
          ? reportData?.config?.calendarIds
          : [],
        types: reportData?.config?.types ?? [],
      });
      if (!res) {
        message.error(
          res?.error?.message ? res?.error?.message : "Export Failed"
        );
      } else {
        if (window.gtag) {
          window.gtag("event", "download_report", {
            value: "Time Sheet Report",
          });
        }
        ExcelExport({ file: res, name: "Tracker 23 Time Sheet Report" });
      }
    } catch (error) {
      message.error("Export Failed");
    }
    setDownloading(false);
  };

  const getTimeSheetReport = async () => {
    if (!inView) return;
    setIsLoading(true);
    const obj = {
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: reportData?.config?.userIds ? reportData?.config?.userIds : [],
      projectIds: reportData?.config?.projectIds
        ? reportData?.config?.projectIds
        : [],
      calendarIds: reportData?.config?.calendarIds
        ? reportData?.config?.calendarIds
        : [],
      types: reportData?.config?.types ?? [],
    };
    const res = await userAPI.getTimeSheetReport(obj);
    res.columns && setColumns(res.columns);
    res.rows && setData(res.rows);
    setDateRangeArray(res.dateRange);
    setIsLoading(false);
  };

  useEffect(() => {
    getTimeSheetReport();
  }, [reportData?.config, inView]);

  return (
    <>
      <ReportHeaderComponent
        title={reportData.name}
        reportData={reportData}
        setIsLoading={setIsLoading}
        exportButton={
          <Button
            type="ghost"
            loading={downloading}
            onClick={excelExport}
            icon={<LuDownload className="text-xl" />}
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
          >
            {!isMobile && "Export to Excel"}
          </Button>
        }
        extraFilterComponent={
          <ReportConfigDescription reportData={reportData} />
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <TableComponent
          data={data}
          column={column}
          dateRangeArray={dateRangeArray}
          reportData={reportData}
        />
      </Spin>
    </>
  );
};

export default TimeSheetReport;
