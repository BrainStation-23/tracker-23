import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import SprintEstimationReportSettings from "./components/sprintEstimationReportSettings";
import SprintReportSettings from "./components/sprintReportSettings";
import SprintTimelineReportSettings from "./components/sprintTimelineReportSettings";
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
      case "SPRINT_REPORT":
        return <SprintReportSettings reportData={reportInEdit} />;
      case "SPRINT_TIMELINE":
        return <SprintTimelineReportSettings reportData={reportInEdit} />;
      default:
        return <div>No report found</div>;
    }
  };
  return (
    <div className="h-screen min-w-[350px] max-w-[350px] py-6 shadow-2xl">
      {reportSettingsToRender()}
    </div>
  );
};

export default ReportSettings;
