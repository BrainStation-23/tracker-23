import { Checkbox, CheckboxProps, message } from "antd";
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
const ScrumReportSettings = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [filterDateType, setFilterDateType] = useState(
    FilterDateType.THIS_WEEK
  );
  const [sprint, setSprint] = useState<number>(
    reportData?.config?.sprintIds?.length > 0
      ? reportData?.config?.sprintIds[0]
      : null
  );
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );

  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate && reportData?.config?.endDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType, true)
  );

  const getFilterDateType = (type: FilterDateType) => {
    setFilterDateType(type);
  };
  const [excludeUnworkedTasks, setExcludeUnworkedTasks] = useState(
    reportData?.config?.excludeUnworkedTasks
  );

  const saveConfig = async (extraData?: UpdateReportDto) => {
    const res = await userAPI.updateReport(reportData.id, {
      projectIds: projects,
      sprintIds: sprint ? [sprint] : [],
      startDate: dateRange[0],
      endDate: dateRange[1],
      filterDateType,
      excludeUnworkedTasks,
      ...(extraData ?? {}),
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
      dispatch(setReportInEditSlice(null));
    }
  };

  const onChangeExcludeUnworkedTasksCheckbox: CheckboxProps["onChange"] = (
    e
  ) => {
    setExcludeUnworkedTasks(e.target.checked);
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
        scrum={true}
      />

      <Checkbox
        checked={excludeUnworkedTasks}
        onChange={onChangeExcludeUnworkedTasksCheckbox}
        className="hidden"
      >
        Exclude unworked tasks
      </Checkbox>
      <TypeDependentSection
        {...{
          activeTab: "Scrum Report",
          projects,
          setProjects,
          sprints: [sprint],
          setSprints: setSprint,
        }}
      />
    </ReportSettingsWrapper>
  );
};

export default ScrumReportSettings;
