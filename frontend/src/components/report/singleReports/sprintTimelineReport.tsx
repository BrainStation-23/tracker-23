import React, { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import { userAPI } from "APIs";
import { FilterDateType, SprintViewTimelineReportDto } from "models/reports";
import { LuDownload } from "react-icons/lu";

import { ReportData } from "@/storage/redux/reportsSlice";

import { getDateRangeArray } from "@/components/common/datePicker";
import ReportHeaderComponent from "../components/reportHeaderComponent";
import SprintViewTimelineReportComponent from "../components/sprintViewTimelineReportComponent";

type Props = {
  reportData: ReportData;
  inView: Boolean;
};

export default function SprintTimelineReport({ reportData, inView }: Props) {
  const dateRange =
    reportData?.config?.filterDateType === FilterDateType.CUSTOM_DATE
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config.filterDateType);

  const [isLoading, setIsLoading] = useState(false);
  const [sprintTimelineReportData, setSprintTimelineReportData] =
    useState<SprintViewTimelineReportDto>();

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
    });
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
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            onClick={() => console.log("excelExport is not implemented...")}
            icon={<LuDownload className="text-xl" />}
            disabled={true}
            type="ghost"
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
