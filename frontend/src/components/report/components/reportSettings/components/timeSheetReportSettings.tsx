import { message } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { FilterDateType, SprintUser, UpdateReportDto } from "models/reports";
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
    reportData?.config?.startDate && reportData?.config?.endDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray(reportData?.config?.filterDateType)
  );

  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };

  const saveConfig = async (extraData?: UpdateReportDto) => {
    const res = await userAPI.updateReport(reportData.id, {
      calendarIds,
      filterDateType,
      projectIds: projects,
      endDate: dateRange[1],
      types: selectedSource,
      userIds: selectedUsers,
      startDate: dateRange[0],
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

      {users.length ? (
        <UsersSelectorComponent
          {...{ userList: users, selectedUsers, setSelectedUsers }}
          className="w-full min-w-[210px]"
        />
      ) : null}
    </ReportSettingsWrapper>
  );
};

export default TimeSheetReportSettings;
