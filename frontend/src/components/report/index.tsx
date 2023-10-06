import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { getArrayOfDatesInRange, getDateRangeArray } from "../datePicker";
import { formatUserData } from "../datePicker/index";
import TableComponent from "./components/tableComponentReport";
import ReportWrapper from "./components/reportWrapper";
const ReportComponent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [dateRange, setDateRange] = useState(getDateRangeArray("this-week"));
    const [dateRangeArray, setDateRangeArray] = useState([]);
    const [column, setColumns] = useState([]);
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
    useEffect(() => {
        getReport();
    }, [dateRange]);
    data.length > 0 && console.log(">>>>>", data[0], data[0]["Oct 01 , 2023"]);
    return (
        <div className="overflow-auto">
            <div className="mb-4 flex justify-between">
                <h2 className="text-2xl font-bold">Reports</h2>
            </div>
            <ReportWrapper
                title="Time Sheet"
                tooltipMessage="This Week"
                setDateRange={setDateRange}
                isLoading={isLoading}
            >
                <TableComponent
                    data={data}
                    dateRangeArray={dateRangeArray}
                    column={column}
                />
            </ReportWrapper>
        </div>
    );
};

export default ReportComponent;
