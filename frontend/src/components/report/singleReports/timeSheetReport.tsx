import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { SprintUser } from "models/reports";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
import DateRangePicker, {
  getDateRangeArray,
} from "@/components/common/datePicker";
import { ExcelExport } from "@/services/exportHelpers";
import { ReportData, updateReportSlice } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import TableComponent from "../components/tableComponentReport";
import TypeDependentSection from "../components/typeDependentSection";

type Props = {
  reportData: ReportData;
};
const TimeSheetReport = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [selectedSource, setSelectedSource] = useState<IntegrationType[]>(
    reportData?.config?.types ?? []
  );
  const [sprints, setSprints] = useState<number[]>([]);
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );
  const [calendarIds, setCalendarIds] = useState<number[]>(
    reportData?.config?.calendarIds ? reportData?.config?.calendarIds : []
  );
  const [column, setColumns] = useState([]);
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    reportData?.config?.userIds ? reportData?.config?.userIds : []
  );
  const [dateRange, setDateRange] = useState(
    reportData?.config?.startDate
      ? [reportData?.config?.startDate, reportData?.config?.endDate]
      : getDateRangeArray("this-week")
  );
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

  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: selectedUsers,
      projectIds: projects,
      calendarIds,
      types: selectedSource,
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
    }
  };
  const getTimeSheetReport = async () => {
    setIsLoading(true);
    const res = await userAPI.getTimeSheetReport({
      startDate: dateRange[0],
      endDate: dateRange[1],
      userIds: selectedUsers,
      projectIds: projects,
      calendarIds,
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
        setIsLoading={setIsLoading}
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
        saveCofigButton={
          <PrimaryButton onClick={() => saveConfig()}> Save</PrimaryButton>
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
