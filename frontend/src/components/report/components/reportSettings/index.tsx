import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import SprintEstimationReportSettings from "./components/sprintEstimationReportSettings";
import TaskListReportSettings from "./components/taskListReportSettings";
import TimeSheetReportSettings from "./components/timeSheetReportSettings";

const ReportSettings = () => {
  const reportInEdit = useAppSelector(
    (state: RootState) => state.reportsSlice.reportInEdit
  );
  const reportSettingsToRender = () => {
    switch (reportInEdit.reportType) {
      case "TIME_SHEET":
        return <TimeSheetReportSettings reportData={reportInEdit} />;
      case "SPRINT_ESTIMATION":
        return <SprintEstimationReportSettings reportData={reportInEdit} />;
      case "TASK_LIST":
        return <TaskListReportSettings reportData={reportInEdit} />;
      // case "SPRINT_REPORT":
      //   return <SprintReport reportData={reportInEdit} />;
      // case "SPRINT_TIMELINE":
      //   return <SprintTimelineReport reportData={reportInEdit} />;
      default:
        return <div>No report found</div>;
    }
  };
  return (
    <div className="h-screen min-w-[350px] max-w-[350px] pt-12 shadow-2xl">
      {reportSettingsToRender()}
    </div>
  );
};

export default ReportSettings;
