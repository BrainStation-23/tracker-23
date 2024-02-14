import { Button, Spin } from "antd";
import { userAPI } from "APIs";
import { FilterDateType, SprintReportDto } from "models/reports";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import { getDateRangeArray } from "@/components/common/datePicker";
import { ReportData } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import SprintReportComponent from "../components/sprintReportComponents";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};
const SprintReport = ({ reportData, inView }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sprintReportData, setSprintReportData] = useState<SprintReportDto>();

  const dateRange =
    reportData?.config?.filterDateType === FilterDateType.CUSTOM_DATE
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType);

  const excelExport = async () => {
    setDownloading(true);
    setDownloading(false);
  };

  const getSprintReport = async () => {
    if (!inView) return;
    setIsLoading(true);
    if (reportData?.config?.sprintIds?.length > 0) {
      const res = await userAPI.getSprintReport({
        sprintId: reportData?.config?.sprintIds[0],
        startDate: dateRange[0],
        endDate: dateRange[1],
      });
      res && setSprintReportData(res);
    }
    setIsLoading(false);
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
            loading={downloading}
            type="ghost"
          >
            Export to Excel
          </Button>
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <SprintReportComponent data={sprintReportData} />
      </Spin>
    </>
  );
};

export default SprintReport;
