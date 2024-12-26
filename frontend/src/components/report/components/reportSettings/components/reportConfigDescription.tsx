import { Tooltip, Typography, message } from "antd";
import { ReportData, setReportInEditSlice } from "@/storage/redux/reportsSlice";
import { CalendarOutlined } from "@ant-design/icons";
import {
  LuBringToFront,
  LuCalendarDays,
  LuFolderOpen,
  LuUsers,
  LuFilterX,
} from "react-icons/lu";
import { GiSprint } from "react-icons/gi";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useEffect, useState } from "react";
import { report } from "process";
import { getDate } from "@/components/common/datePicker";

const { Text } = Typography;

const ReportConfigDescription = ({
  reportData,
}: {
  reportData: ReportData;
}) => {
  const dispatch = useDispatch();
  const [sprintName, setSprintName] = useState("");
  const [fullSprintName, setFullSprintName] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    reportData?.config?.filterDateType
      ? reportData?.config?.filterDateType === "CUSTOM_DATE"
        ? reportData?.config?.startDate
        : getDate(reportData?.config?.filterDateType)
      : getDate("today")
  );

  const sprintData = useAppSelector(
    (state: RootState) => state.projectList.reportSprintList
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function getSprintName() {
    if (reportData?.config?.sprintIds?.length === 1) {
      const sprint = sprintData.find(
        (s) => s.id === reportData?.config?.sprintIds[0]
      );
      return sprint ? sprint.name : "";
    }
    return "";
  }

  function truncateName(name: string) {
    if (name.length > 10) {
      return name.slice(0, 8) + "...";
    }
    return name;
  }

  const reportInEdit = useAppSelector(
    (state: RootState) => state.reportsSlice.reportInEdit
  );
  function handleEdit() {
    if (reportInEdit && reportData.id !== reportInEdit.id) {
      message.error(
        "Report is already in edit. Please save or cancel the previous report to edit different report"
      );
    } else {
      dispatch(setReportInEditSlice(reportData));
    }
  }

  useEffect(() => {
    setFullSprintName(getSprintName());
    setSprintName(truncateName(getSprintName()));
  }, [sprintData, reportData, getSprintName]);

  useEffect(() => {
    if (reportData?.config?.filterDateType) {
      if (reportData.config.filterDateType === "CUSTOM_DATE") {
        setSelectedDate(reportData.config.startDate);
      } else {
        setSelectedDate(getDate(reportData.config.filterDateType));
      }
    } else {
      setSelectedDate(getDate("today"));
    }
  }, [reportData]);

  return (
    <div className="flex flex-wrap items-center justify-start gap-4">
      {reportData?.config?.startDate && reportData?.config?.endDate && (
        <div
          className="flex items-center justify-center gap-2 hover:cursor-pointer hover:text-[#3498db]"
          onClick={handleEdit}
        >
          <Tooltip title="Date Range">
            <CalendarOutlined size={20} />
          </Tooltip>
          <div className="text-sm">
            {reportData?.reportType === "SCRUM_REPORT"
              ? `${selectedDate}`
              : `${reportData?.config?.startDate} - ${reportData?.config?.endDate}`}
          </div>
        </div>
      )}

      {reportData?.config?.types && reportData.config.types?.length > 0 && (
        <div
          className="flex items-center justify-center gap-1 hover:cursor-pointer hover:text-[#3498db]"
          onClick={handleEdit}
        >
          <Tooltip title="Source">
            <LuBringToFront size={16} />
          </Tooltip>
          <Text
            ellipsis={{
              tooltip:
                reportData.config.types.length === 1
                  ? reportData.config.types[0]
                  : reportData.config.types.length > 1
                  ? `${reportData.config.types.join(", ")}`
                  : "No source selected",
            }}
            className="max-w-[210px] hover:text-[#3498db]"
          >
            {reportData.config.types.length === 1
              ? reportData.config.types[0]
              : reportData.config.types.length > 1
              ? `${reportData.config.types.join(", ")}`
              : ""}{" "}
          </Text>
        </div>
      )}

      {reportData?.config?.projectIds &&
        reportData?.config?.projectIds?.length > 0 && (
          <div
            className="flex items-center justify-center gap-1 hover:cursor-pointer hover:text-[#3498db]"
            onClick={handleEdit}
          >
            <Tooltip title="Project(s)">
              <LuFolderOpen size={16} />
            </Tooltip>
            <div>
              {reportData?.config?.projectIds.length}{" "}
              {reportData?.config?.projectIds.length === 1
                ? "Project"
                : "Projects"}
            </div>
          </div>
        )}

      {reportData?.config?.sprintIds &&
        reportData?.config?.sprintIds.length > 0 && (
          <div
            className="flex items-center justify-center gap-1 hover:cursor-pointer hover:text-[#3498db]"
            onClick={handleEdit}
          >
            <Tooltip title={fullSprintName} className="flex">
              <GiSprint size={16} />
              <div className="pl-2">{sprintName}</div>
            </Tooltip>
          </div>
        )}

      {reportData?.config?.calendarIds &&
        reportData?.config?.calendarIds?.length > 0 && (
          <div
            className="flex items-center justify-center gap-1 hover:cursor-pointer hover:text-[#3498db]"
            onClick={handleEdit}
          >
            <Tooltip title="Calendar(s)">
              <LuCalendarDays size={16} />
            </Tooltip>
            <div>
              {reportData?.config?.calendarIds.length}{" "}
              {reportData?.config?.calendarIds.length === 1
                ? "Calendar"
                : "Calendars"}
            </div>
          </div>
        )}

      {reportData?.config?.userIds &&
        reportData?.config?.userIds?.length > 0 && (
          <div
            className="flex items-center justify-center gap-1 hover:cursor-pointer hover:text-[#3498db]"
            onClick={handleEdit}
          >
            <Tooltip title="User(s)">
              <LuUsers size={16} />
            </Tooltip>
            <div>
              {reportData?.config?.userIds.length}{" "}
              {reportData?.config?.userIds.length === 1 ? "User" : "Users"}
            </div>
          </div>
        )}
      {reportData?.config?.excludeUnworkedTasks && (
        <div
          className="flex items-center justify-center gap-1 hover:cursor-pointer hover:text-[#3498db]"
          onClick={handleEdit}
        >
          <Tooltip title="Excluded Unworked Tasks">
            <LuFilterX size={16} />
          </Tooltip>
          <div>Excluded unworked tasks</div>
        </div>
      )}
    </div>
  );
};

export default ReportConfigDescription;
