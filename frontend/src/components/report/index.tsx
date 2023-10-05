import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { getArrayOfDatesInRange, getDateRangeArray } from "../datePicker";
import { formatUserData } from "../datePicker/index";
import TableComponent from "./tableComponent copy";
import ReportWrapper from "./reportWrapper";
const ReportComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState(getDateRangeArray("this-week"));
  const dateRangeArray = getArrayOfDatesInRange(dateRange[0], dateRange[1]);
  const getReport = async () => {
    setIsLoading(true);
    const res = await userAPI.getTimeSheetReport({
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    console.log(
      "🚀 ~ file: index.tsx:20 ~ getReport ~ res:",
      formatUserData(res)
    );
    setData(formatUserData(res));
    setIsLoading(false);
  };
  useEffect(() => {
    getReport();
  }, [dateRange]);
  data.length > 0 && console.log(">>>>>", data[0], data[0]["Oct 01 , 2023"]);
  return (
    <>
      <ReportWrapper
        title="Work Per Day"
        tooltipMessage="This Week"
        setDateRange={setDateRange}
        isLoading={isLoading}
      >
        <TableComponent data={data} dateRange={dateRangeArray} />
      </ReportWrapper>
    </>
  );
};

export default ReportComponent;
