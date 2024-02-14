import { message } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { FilterDateType, SprintUser } from "models/reports";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import DateRangePicker, {
  getDateRangeArray,
} from "@/components/common/datePicker";
import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
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
const TimeSheetReportSettings = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [filterDateType, setFilterDateType] = useState(
    FilterDateType.THIS_WEEK
  );
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [sprints, setSprints] = useState<number[]>([]);
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>(
    reportData?.config?.types ?? []
  );
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );
  const [calendarIds, setCalendarIds] = useState<number[]>(
    reportData?.config?.calendarIds ? reportData?.config?.calendarIds : []
  );
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    reportData?.config?.userIds ? reportData?.config?.userIds : []
  );
  const [dateRange, setDateRange] = useState(
    reportData?.config?.filterDateType === FilterDateType.CUSTOM_DATE
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config.filterDateType)
  );
  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };

  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: selectedUsers,
      projectIds: projects,
      calendarIds,
      types: selectedSource,
      filterDateType,
    });
    if (res) {
      console.log("res", res);

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
      }}
    >
      <DateRangePicker
        selectedDate={dateRange}
        setSelectedDate={setDateRange}
        setFilterDateType={getFilterDateType}
      />

      <TypeDependentSection
        {...{
          activeTab: "Time Sheet",
          selectedSource,
          setSelectedSource,
          projects,
          setProjects,
          sprints,
          setSprints,
          calendarIds,
          setCalendarIds,
        }}
      />

      <UsersSelectorComponent
        {...{ userList: users, selectedUsers, setSelectedUsers }}
        className="w-[210px]"
      />
    </ReportSettingsWrapper>
  );
};

export default TimeSheetReportSettings;
