import { message } from "antd";
import { userAPI } from "APIs";
import { useState } from "react";
import { useDispatch } from "react-redux";

import DateRangePicker, {
  getDateRangeArray,
} from "@/components/common/datePicker";
import {
  ReportData,
  setReportInEditSlice,
  updateReportSlice,
} from "@/storage/redux/reportsSlice";

import TypeDependentSection from "../../typeDependentSection";
import ReportSettingsWrapper from "./reportSettingsWrapper";

type Props = {
  reportData: ReportData;
};
const SprintViewTimelineReportSettings = ({ reportData }: Props) => {
  const dispatch = useDispatch();
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
  //@ts-ignore
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
      dispatch(setReportInEditSlice(null));
    }
  };
  return (
    <ReportSettingsWrapper
      {...{
        reportData,
        saveConfig,
      }}
    >
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
    </ReportSettingsWrapper>
  );
};

export default SprintViewTimelineReportSettings;
