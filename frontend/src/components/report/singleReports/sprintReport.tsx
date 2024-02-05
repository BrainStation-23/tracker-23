import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { SprintReportDto } from "models/reports";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import DateRangePicker, {
  getDateRangeArray,
} from "@/components/common/datePicker";
import { ReportData, updateReportSlice } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import SprintReportComponent from "../components/sprintReportComponents";
import TypeDependentSection from "../components/typeDependentSection";

type Props = {
  reportData: ReportData;
};
const SprintReport = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [sprint, setSprint] = useState<number>(
    reportData?.config?.sprintIds?.length > 0
      ? reportData?.config?.sprintIds[0]
      : null
  );
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ?? []
  );
  const [sprintReportData, setSprintReportData] = useState<SprintReportDto>();
  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray("this-week")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      projectIds: projects,
      sprintIds: [sprint],
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
    }
  };
  const excelExport = async () => {
    setDownloading(true);

    setDownloading(false);
  };

  const getSprintReport = async () => {
    setIsLoading(true);
    if (sprint) {
      const res = await userAPI.getSprintReport({
        sprintId: sprint,
        startDate: dateRange[0],
        endDate: dateRange[1],
      });
      res && setSprintReportData(res);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    getSprintReport();
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
            onClick={() => excelExport()}
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
              activeTab: "Sprint Report",
              projects,
              setProjects,
              sprints: [sprint],
              setSprints: setSprint,
            }}
          />
        </>
      </ReportHeaderComponent>
      <Spin className="custom-spin" spinning={isLoading}>
        <SprintReportComponent data={sprintReportData} />
      </Spin>
    </>
  );
};

export default SprintReport;
