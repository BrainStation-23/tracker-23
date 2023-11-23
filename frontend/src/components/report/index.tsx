import { userAPI } from "APIs";
import { SprintTableData } from "models/reports";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setSprintListReducer } from "@/storage/redux/tasksSlice";

import DateRangePicker, { getDateRangeArray } from "../datePicker";
import ReportWrapper from "./components/reportWrapper";
import SpritReportComponent from "./components/sprintReportComponent";
import TableComponent from "./components/tableComponentReport";

const ReportComponent = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [sprints, setSprints] = useState([]);
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
  useEffect(() => {
    getReport();
  }, [dateRange]);
  useEffect(() => {
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
        }}
        topPanelComponent={
          <DateRangePicker
            selectedDate={dateRange}
            setSelectedDate={setDateRange}
          />
        }
      >
        {activeTab === "Time Sheet" ? (
          <TableComponent
            data={data}
            dateRangeArray={dateRangeArray}
            column={column}
          />
        ) : (
          <SpritReportComponent data={sampleData} />
        )}
      </ReportWrapper>
    </div>
  );
};

export default ReportComponent;
const sampleData: SprintTableData = {
  columns: ["user1", "user2", "user3", "user4", "user5", "user6"],
  rows: [
    {
      sprintId: 1,
      name: "sprint-1",
      user1: { estimation: 10, timeSpent: 5 },
      user2: { estimation: 10, timeSpent: 5 },
      user3: { estimation: 10, timeSpent: 5 },
      user4: { estimation: 10, timeSpent: 5 },
      user5: { estimation: 10, timeSpent: 5 },
      user6: { estimation: 10, timeSpent: 5 },
    },
    {
      sprintId: 2,
      name: "sprint-2",
      user1: { estimation: 10, timeSpent: 5 },
      user2: { estimation: 10, timeSpent: 5 },
      user3: { estimation: 10, timeSpent: 5 },
      user4: { estimation: 10, timeSpent: 5 },
      user5: { estimation: 10, timeSpent: 5 },
      user6: { estimation: 10, timeSpent: 5 },
    },
    {
      sprintId: 3,
      name: "sprint-3",
      user1: { estimation: 8, timeSpent: 4 },
      user2: { estimation: 8, timeSpent: 4 },
      user3: { estimation: 8, timeSpent: 4 },
      user4: { estimation: 8, timeSpent: 4 },
      user5: { estimation: 8, timeSpent: 4 },
      user6: { estimation: 8, timeSpent: 4 },
    },
    {
      sprintId: 4,
      name: "sprint-4",
      user1: { estimation: 12, timeSpent: 6 },
      user2: { estimation: 12, timeSpent: 6 },
      user3: { estimation: 12, timeSpent: 6 },
      user4: { estimation: 12, timeSpent: 6 },
      user5: { estimation: 12, timeSpent: 6 },
      user6: { estimation: 12, timeSpent: 6 },
    },
  ],
};
