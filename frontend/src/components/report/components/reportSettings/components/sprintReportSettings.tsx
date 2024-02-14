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
import { FilterDateType } from "models/reports";

type Props = {
  reportData: ReportData;
};
const SprintReportSettings = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [sprint, setSprint] = useState<number>(
    reportData?.config?.sprintIds?.length > 0
      ? reportData?.config?.sprintIds[0]
      : null
  );
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );

  const [dateRange, setDateRange] = useState(
    reportData?.config?.filterDateType === FilterDateType.CUSTOM_DATE
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config.filterDateType)
  );

  const getFilterDateType = (type: string) => {
    console.log("getFilterDateType", type);
  };
  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      projectIds: projects,
      sprintIds: sprint ? [sprint] : [],
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
        setFilterDateType={getFilterDateType}
      />
      <TypeDependentSection
        {...{
          activeTab: "Sprint Report",
          projects,
          setProjects,
          sprints: [sprint],
          setSprints: setSprint,
        }}
      />
    </ReportSettingsWrapper>
  );
};

export default SprintReportSettings;
