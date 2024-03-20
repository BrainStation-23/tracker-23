import { Tooltip, Typography } from "antd";
import { ReportData } from "@/storage/redux/reportsSlice";
import { CalendarOutlined } from "@ant-design/icons";
import {
  LuBringToFront,
  LuCalendarDays,
  LuFolderOpen,
  LuUsers,
} from "react-icons/lu";
import { GiSprint } from "react-icons/gi";

const { Text } = Typography;

const ReportConfigDescription = ({
  reportData,
}: {
  reportData: ReportData;
}) => {
  return (
    <div className="flex flex-wrap items-center justify-start gap-4">
      {reportData?.config?.startDate && reportData?.config?.endDate && (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="Date Range">
            <CalendarOutlined size={20} />
          </Tooltip>
          <div className="text-sm">
            {reportData?.config?.startDate} - {reportData?.config?.endDate}
          </div>
        </div>
      )}

      {reportData?.config?.types && reportData.config.types?.length > 0 && (
        <div className="flex items-center justify-center gap-1">
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
            className="max-w-[210px]"
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
          <div className="flex items-center justify-center gap-1">
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
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="Sprint(s)">
              <GiSprint size={16} />
            </Tooltip>
            <div>
              {reportData?.config?.sprintIds?.length}{" "}
              {reportData?.config?.sprintIds?.length === 1
                ? "Sprint"
                : "Sprints"}
            </div>
          </div>
        )}

      {reportData?.config?.calendarIds &&
        reportData?.config?.calendarIds?.length > 0 && (
          <div className="flex items-center justify-center gap-1">
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
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="User(s)">
              <LuUsers size={16} />
            </Tooltip>
            <div>
              {reportData?.config?.userIds.length}{" "}
              {reportData?.config?.userIds.length === 1 ? "User" : "Users"}
            </div>
          </div>
        )}
    </div>
  );
};

export default ReportConfigDescription;
