import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setSprintListReducer } from "@/storage/redux/tasksSlice";

import DateRangePicker, { getDateRangeArray } from "../datePicker";
import ReportWrapper from "./components/reportWrapper";
import SpritReportComponent from "./components/sprintReportComponent";
import TableComponent from "./components/tableComponentReport";
import { SprintReportDto } from "models/reports";

const ReportComponent = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [sprintReportData, setSprintReportData] = useState<SprintReportDto>();
  const [sprints, setSprints] = useState<number[]>([]);
  const [projects, setProjects] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState(getDateRangeArray("this-week"));
  const [dateRangeArray, setDateRangeArray] = useState([]);
  const [column, setColumns] = useState([]);
  const [activeTab, setActiveTab] = useState("Time Sheet");
  //  getArrayOfDatesInRange(dateRange[0], dateRange[1]);
  const getReport = async () => {
    setIsLoading(true);
    const res = await userAPI.getTimeSheetReport({
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: selectedUsers,
      projectIds: projects,
    });
    res.columns && setColumns(res.columns);

    res.rows && setData(res.rows);
    setDateRangeArray(res.dateRange);
    // setData(formatUserData(res));
    setIsLoading(false);
  };
  const getSprintList = async () => {
    const res = await userAPI.getJiraSprints();
    if (res?.length > 0) dispatch(setSprintListReducer(res));
  };
  const getSprintReport = async () => {
    setIsLoading(true);
    const res: SprintReportDto = await userAPI.getSprintReport({
      sprints,
      selectedUsers,
      projectIds: projects,
    });
    res && setSprintReportData(res);
    setIsLoading(false);
  };
  useEffect(() => {
    getReport();
  }, [dateRange, selectedUsers, projects]);

  useEffect(() => {
    getSprintReport();
  }, [sprints, selectedUsers, projects]);
  useEffect(() => {
    getSprintReport();
    getSprintList();
  }, []);
  return (
    <div className="">
      <ReportWrapper
        title="Time Reports"
        tooltipMessage="This Week"
        {...{
          setDateRange,
          dateRange,
          isLoading,
          activeTab,
          setActiveTab,
          sprints,
          setSprints,
          projects,
          setProjects,
          sprintReportData,
          selectedUsers,
          setSelectedUsers,
        }}
        topPanelComponent={
          activeTab === "Time Sheet" && (
            <DateRangePicker
              selectedDate={dateRange}
              setSelectedDate={setDateRange}
            />
          )
        }
      >
        {activeTab === "Time Sheet" ? (
          <TableComponent
            data={data}
            dateRangeArray={dateRangeArray}
            column={column}
          />
        ) : (
          <SpritReportComponent data={sprintReportData} />
        )}
      </ReportWrapper>
    </div>
  );
};

export default ReportComponent;
