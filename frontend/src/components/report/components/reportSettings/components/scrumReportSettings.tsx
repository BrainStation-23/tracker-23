import { Checkbox, CheckboxProps, message } from "antd";
import { userAPI } from "APIs";
import { useState } from "react";
import { useDispatch } from "react-redux";

import DateRangePicker, {
  getDate,
  getDateRangeArray,
  SingleDatePicker,
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
    FilterDateType.TODAY
  );
  const [sprint, setSprint] = useState<number>(
    reportData?.config?.sprintIds?.length > 0
      ? reportData?.config?.sprintIds[0]
      : null
  );
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );

  const [selectedDate, setSelectedDate] = useState(
    reportData?.config?.startDate
      ? reportData?.config?.startDate
      : getDate(reportData?.config?.filterDateType)
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
      startDate:selectedDate,
      endDate: selectedDate,
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
      <SingleDatePicker selectedDate= {selectedDate} 
      setSelectedDate={setSelectedDate }
      setFilterDateType={getFilterDateType}
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
