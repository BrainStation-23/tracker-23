import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useRouter } from "next/router";
import TimeSheetReport from "./singleReports/timeSheetReport";
import { userAPI } from "APIs";
import { useDispatch } from "react-redux";
import {
  setReportProjectsSlice,
  setReportSprintListReducer,
} from "@/storage/redux/projectsSlice";
import { useEffect } from "react";

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
        if (report?.reportType === "TIME_SHEET")
          return <TimeSheetReport reportData={report} />;
      })}
    </div>
  );
};

export default ReportPageComponent;
