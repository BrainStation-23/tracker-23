import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { debounce } from "lodash";
import { IntegrationType } from "models/integration";
import { ReportPageTabs, SprintUser } from "models/reports";
import { useEffect, useState } from "react";

import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
import DateRangePicker, { getDateRangeArray } from "@/components/datePicker";
import { ReportData } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import TableComponent from "../components/tableComponentReport";
import TypeDependentSection from "../components/typeDependentSection";
import { LuDownload } from "react-icons/lu";
import { ExcelExport } from "@/services/exportHelpers";

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
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportTimeSheetReport({
        startDate: dateRange[0],
        endDate: dateRange[1],
        userIds: selectedUsers,
        types: selectedSource,
        projectIds: projects,
        calendarIds,
      });
      console.log(
        "🚀 ~ file: topPanelExportPage.tsx:54 ~ excelExport ~ res:",
        res
      );
      if (!res) {
        message.error(
          res?.error?.message ? res?.error?.message : "Export Failed"
        );
      } else {
        ExcelExport({ file: res, name: "Tracker 23 Time Sheet Report" });
      }
    } catch (error) {
      message.error("Export Failed");
    }
    setDownloading(false);
  };

  const getTimeSheetReport = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
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
      <ReportHeaderComponent
        title={reportData.name}
        reportData={reportData}
        exportButton={
          <Button
            type="ghost"
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            icon={<LuDownload className="text-xl" />}
            loading={downloading}
            onClick={() => excelExport()}
          >
            Export to Excel
          </Button>
        }
      >
        <>
          <DateRangePicker
            selectedDate={dateRange}
            setSelectedDate={setDateRange}
          />

          <TypeDependentSection
            config={reportData?.config}
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
        </>
      </ReportHeaderComponent>
      <Spin className="custom-spin" spinning={isLoading}>
        <TableComponent
          data={data}
          dateRangeArray={dateRangeArray}
          column={column}
        />
      </Spin>
    </>
  );
};

export default TimeSheetReport;
