import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import React, { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";

import { ReportData, updateReportSlice } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import TypeDependentSection from "../components/typeDependentSection";
import SprintViewTimelineReportComponent from "../components/sprintViewTimelineReportComponent";
import { SprintViewTimelineReportDto } from "models/reports";

type Props = {
  reportData: ReportData;
};

export default function SprintTimelineReport({ reportData }: Props) {
  const dispatch = useDispatch();
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

  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      projectIds: [project],
      sprintIds: [sprint],
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
    }
  };

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
        saveCofigButton={
          <PrimaryButton onClick={() => saveConfig()}> Save</PrimaryButton>
        }
      >
        <>
          <DateRangePicker
            selectedDate={dateRange}
            setSelectedDate={setDateRange}
          />

          <TypeDependentSection
            config={reportData?.config}
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
