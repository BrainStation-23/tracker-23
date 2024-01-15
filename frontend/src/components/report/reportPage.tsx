import { userAPI } from "APIs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useAppSelector } from "@/storage/redux";
import {
  setReportProjectsSlice,
  setReportSprintListReducer,
} from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";

import SprintEstimateReport from "./singleReports/sprintEstimateReport";
import SprintReport from "./singleReports/sprintReport";
import TaskListReport from "./singleReports/taskListReport";
import TimeSheetReport from "./singleReports/timeSheetReport";

const ReportPageComponent = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const path = router.asPath;
  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;

  const reportPageData = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  ).find((reportPage) => reportPage.id === pageId);
  console.log("🚀 ~ ReportPageComponent ~ reportPageData:", reportPageData);
  const getSprintList = async () => {
    const res = await userAPI.getReportSprints();
    if (res?.length > 0) dispatch(setReportSprintListReducer(res));
  };
  const getProjectWiseStatues = async () => {
    {
      const res = await userAPI.getAllReportProjects();
      res && dispatch(setReportProjectsSlice(res));
    }
  };

  useEffect(() => {
    getSprintList();
    getProjectWiseStatues();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div> {path}</div> <div>{reportPageData?.name}</div>
      {reportPageData?.reports?.map((report) => {
        switch (report.reportType) {
          case "TIME_SHEET":
            return <TimeSheetReport reportData={report} />;
          case "SPRINT_ESTIMATION":
            return <SprintEstimateReport reportData={report} />;
          case "TASK_LIST":
            return <TaskListReport reportData={report} />;
          case "SPRINT_REPORT":
            return <SprintReport reportData={report} />;
          default:
            return <div>No report found</div>;
        }
      })}
    </div>
  );
};

export default ReportPageComponent;
