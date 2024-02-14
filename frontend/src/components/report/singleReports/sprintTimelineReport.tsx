import { Button, Spin } from "antd";
import { userAPI } from "APIs";
import { SprintViewTimelineReportDto } from "models/reports";
import React, { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import { getDateRangeArray } from "@/components/common/datePicker";
import { ReportData } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import SprintViewTimelineReportComponent from "../components/sprintViewTimelineReportComponent";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};

export default function SprintTimelineReport({ reportData, inView }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const [downloading, setDownloading] = useState<boolean>(false);
  const [sprintTimelineReportData, setSprintTimelineReportData] =
    useState<SprintViewTimelineReportDto>();

  //@ts-ignore
  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray("this-week")
  );

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
      startDate: reportData?.config?.startDate
        ? reportData?.config?.startDate
        : dateRange[0],
      endDate: reportData?.config?.endDate
        ? reportData?.config?.endDate
        : dateRange[1],
    });
    console.log("res", res);
    res && setSprintTimelineReportData(res);
    setIsLoading(false);
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
            type="ghost"
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            icon={<LuDownload className="text-xl" />}
            loading={downloading}
            onClick={() => console.log("excelExport is not implemented...")}
            disabled={true}
          >
            Export to Excel
          </Button>
        }
      />
      <Spin className="custom-spin" spinning={isLoading}>
        <SprintViewTimelineReportComponent data={sprintTimelineReportData} />
      </Spin>
    </>
  );
}
