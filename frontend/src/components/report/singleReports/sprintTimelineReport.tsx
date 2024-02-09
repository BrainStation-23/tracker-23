import { Button, Spin } from "antd";
import { userAPI } from "APIs";
import { SprintViewTimelineReportDto } from "models/reports";
import React, { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";

import DateRangePicker, {
  getDateRangeArray,
} from "@/components/common/datePicker";
import { ReportData } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import SprintViewTimelineReportComponent from "../components/sprintViewTimelineReportComponent";
import TypeDependentSection from "../components/typeDependentSection";

type Props = {
  reportData: ReportData;
};

export default function SprintTimelineReport({ reportData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sprint, setSprint] = useState<number>(
    reportData?.config?.sprintIds?.length > 0
      ? reportData?.config?.sprintIds[0]
      : null
  );
  const [project, setProject] = useState<number>(
    reportData?.config?.projectIds?.length > 0
      ? reportData?.config?.projectIds[0]
      : null
  );
  const [sprintTimelineReportData, setSprintTimelineReportData] =
    useState<SprintViewTimelineReportDto>();

  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray("this-week")
  );

  const getSprintViewTimelineReport = async () => {
    if (!(sprint && dateRange[0] && dateRange[0])) {
      setSprintTimelineReportData(null);
      return;
    }
    setIsLoading(true);
    const res = await userAPI.getSprintViewTimelineReport({
      sprintId: sprint,
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    console.log("res", res);
    res && setSprintTimelineReportData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    getSprintViewTimelineReport();
  }, [sprint, dateRange]);

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
      >
        <>
          <DateRangePicker
            selectedDate={dateRange}
            setSelectedDate={setDateRange}
          />

          <TypeDependentSection
            {...{
              activeTab: "Sprint View Timeline Report",
              projects: [project],
              setProjects: setProject,
              sprints: [sprint],
              setSprints: setSprint,
            }}
          />
        </>
      </ReportHeaderComponent>
      <Spin className="custom-spin" spinning={isLoading}>
        <SprintViewTimelineReportComponent data={sprintTimelineReportData} />
      </Spin>
    </>
  );
}
