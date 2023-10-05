import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { getArrayOfDatesInRange, getDateRangeArray } from "../datePicker";
import { formatUserData } from "../datePicker/index";
import TableComponent from "./tableComponent copy";
const ReportComponent = () => {
  const [data, setData] = useState([]);
  const dateRange = getDateRangeArray("this-week");
  const dateRangeArray = getArrayOfDatesInRange(dateRange[0], dateRange[1]);
  const getReport = async () => {
    const res = await userAPI.getTimeSheetReport({
      startDate: dateRange[0],
      endDate: dateRange[1],
    });
    console.log(
      "🚀 ~ file: index.tsx:20 ~ getReport ~ res:",
      formatUserData(res)
    );
    setData(formatUserData(res));
  };
  useEffect(() => {
    getReport();
  }, []);
  data.length > 0 && console.log(">>>>>", data[0], data[0]["Oct 01 , 2023"]);
  return (
    <>
      <TableComponent data={data} dateRange={dateRangeArray} />
    </>
  );
};

export default ReportComponent;
