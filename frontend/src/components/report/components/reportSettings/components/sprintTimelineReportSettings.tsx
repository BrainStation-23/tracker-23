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
import { FilterDateType, UpdateReportDto } from "models/reports";

type Props = {
  reportData: ReportData;
};
const SprintTimelineReportSettings = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [filterDateType, setFilterDateType] = useState(
    FilterDateType.THIS_WEEK
  );
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
  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate && reportData?.config?.endDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType)
  );
  const saveConfig = async (extraData?: UpdateReportDto) => {
    const res = await userAPI.updateReport(reportData.id, {
      projectIds: [project],
      sprintIds: [sprint],
      startDate: dateRange[0],
      endDate: dateRange[1],
      filterDateType,
      ...(extraData ?? {}),
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
      dispatch(setReportInEditSlice(null));
    }
  };
  const getFilterDateType = (type: FilterDateType) => {
    setFilterDateType(type);
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
        setFilterDateType={getFilterDateType}
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

export default SprintTimelineReportSettings;
