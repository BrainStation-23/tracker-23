import { message } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { FilterDateType, SprintUser } from "models/reports";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import DateRangePicker, {
  getDateRangeArray,
} from "@/components/common/datePicker";
import UserSelectorComponent from "@/components/common/topPanels/components/userSelector";
import {
  ReportData,
  setReportInEditSlice,
  updateReportSlice,
} from "@/storage/redux/reportsSlice";

import TypeDependentSection from "../../typeDependentSection";
import ReportSettingsWrapper from "./reportSettingsWrapper";

type Props = {
  reportData: ReportData;
  readonly?: boolean;
};
const TaskListReportSettings = ({ reportData, readonly }: Props) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [filterDateType, setFilterDateType] = useState(
    FilterDateType.THIS_WEEK
  );
  const [sprints, setSprints] = useState<number[]>(
    reportData?.config?.sprintIds ? reportData?.config?.sprintIds : []
  );
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>(
    reportData?.config?.types ?? []
  );
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );
  const [calendarIds, setCalendarIds] = useState<number[]>(
    reportData?.config?.calendarIds ? reportData?.config?.calendarIds : []
  );
  const [selectedUser, setSelectedUser] = useState<number>(
    reportData?.config?.userIds?.length > 0
      ? reportData?.config?.userIds[0]
      : null
  );
  const [dateRange, setDateRange] = useState(
    reportData?.config?.filterDateType === FilterDateType.CUSTOM_DATE
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType)
  );
  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };

  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      startDate: dateRange[0],
      endDate: dateRange[1],
      sprintIds: sprints,
      projectIds: projects,
      calendarIds,
      userIds: selectedUser ? [selectedUser] : [],
      types: selectedSource,
      filterDateType,
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
  useEffect(() => {
    getUserListByProject();
  }, [projects]);
  return (
    <ReportSettingsWrapper
      {...{
        reportData,
        saveConfig,
        readonly,
      }}
    >
      <DateRangePicker
        selectedDate={dateRange}
        setSelectedDate={setDateRange}
        setFilterDateType={getFilterDateType}
        readonly={readonly}
      />

      <TypeDependentSection
        {...{
          activeTab: "Task List",
          selectedSource,
          setSelectedSource,
          projects,
          setProjects,
          sprints,
          setSprints,
          calendarIds,
          setCalendarIds,
          readonly,
        }}
      />

      <UserSelectorComponent
        {...{ userList: users, selectedUser, setSelectedUser, readonly }}
        className="w-[210px]"
      />
    </ReportSettingsWrapper>
  );
};

export default TaskListReportSettings;
