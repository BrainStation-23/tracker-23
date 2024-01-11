import SearchIconSvg from "@/assets/svg/searchIconSvg";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { Input } from "antd";
import { debounce } from "lodash";
import TypeDependentSection from "../components/typeDependentSection";
import UserSelectorComponent from "@/components/common/topPanels/components/userSelector";
import { useEffect, useState } from "react";
import {
  ReportPageTabs,
  SprintUser,
  SprintUserReportDto,
} from "models/reports";
import { TaskDto } from "models/tasks";
import { IntegrationType } from "models/integration";
import TableComponent from "../components/tableComponentReport";
import { userAPI } from "APIs";
import { ReportData } from "@/storage/redux/reportsSlice";
import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
type Props = {
  reportData: ReportData;
};
const TimeSheetReport = ({ reportData }: Props) => {
  console.log("🚀 ~ TimeSheetReport ~ reportData:", reportData);
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>(
    reportData?.config?.types ?? []
  );
  const [sprints, setSprints] = useState<number[]>([]);
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ?? []
  );
  const [calendarIds, setCalendarIds] = useState<number[]>([]);
  const [column, setColumns] = useState([]);
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    reportData?.config?.users ?? []
  );
  const [dateRange, setDateRange] = useState(getDateRangeArray("this-week"));
  const [dateRangeArray, setDateRangeArray] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<ReportPageTabs>(
    "Time Sheet"
    // "Sprint Report"
  );
  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const debouncedHandleInputChange = debounce(handleInputChange, 500);
  const getTimeSheetReport = async () => {
    // setIsLoading(true);
    // Loaded["Time Sheet"] = false;
    const res = await userAPI.getTimeSheetReport({
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: selectedUsers,
      projectIds: projects,
      types: selectedSource,
    });
    res.columns && setColumns(res.columns);

    res.rows && setData(res.rows);
    setDateRangeArray(res.dateRange);
    // setData(formatUserData(res));
    // setIsLoading(false);
    // Loaded["Time Sheet"] = true;
  };
  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };
  useEffect(() => {
    getTimeSheetReport();
  }, [dateRange, selectedUsers, projects, selectedSource]);
  useEffect(() => {
    getUserListByProject();
  }, [projects]);
  return (
    <>
      <div className="my-5 flex w-full justify-between">
        <div className="text-xl font-semibold">{reportData.name}</div>
        <div className="mt-[3px] flex h-auto max-w-[950px] gap-2">
          <div className="flex h-auto w-full flex-wrap items-center justify-end gap-6">
            <DateRangePicker
              selectedDate={dateRange}
              setSelectedDate={setDateRange}
            />

            <TypeDependentSection
              config={reportData?.config}
              {...{
                activeTab,
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
          </div>
        </div>
      </div>
      <div>
        <TableComponent
          data={data}
          dateRangeArray={dateRangeArray}
          column={column}
        />
      </div>
    </>
  );
};

export default TimeSheetReport;
