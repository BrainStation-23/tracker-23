import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaChartBar } from "react-icons/fa";
import { FaChartGantt } from "react-icons/fa6";
import { LuGitCompare } from "react-icons/lu";
import { MdChecklist } from "react-icons/md";
import { useDispatch } from "react-redux";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import GlobalModal from "@/components/modals/globalModal";
import { useAppSelector } from "@/storage/redux";
import {
  setReportProjectsSlice,
  setReportSprintListReducer,
} from "@/storage/redux/projectsSlice";
import {
  ReportData,
  setReportIntegrationTypesSlice,
} from "@/storage/redux/reportsSlice";
import { RootState } from "@/storage/redux/store";

import AddNewReport from "./components/addNewReport";
import IntersectionWrapper from "./components/intersectionWrapper";
import SprintEstimateReport from "./singleReports/sprintEstimateReport";
import SprintReport from "./singleReports/sprintReport";
import SprintTimelineReport from "./singleReports/sprintTimelineReport";
import TaskListReport from "./singleReports/taskListReport";
import TimeSheetReport from "./singleReports/timeSheetReport";

export default function ReportPageComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;

  const reportPageData = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  ).find((reportPage) => reportPage.id === pageId);

  const getSprintList = async () => {
    const res = await userAPI.getReportSprints();
    if (res?.length > 0) dispatch(setReportSprintListReducer(res));
  };

  const getIntegrationTypes = async () => {
    const res = await userAPI.getIntegrationTypesReportPage();
    if (res?.length > 0) {
      const types: IntegrationType[] = Array.from(
        new Set(res.map((type: any) => type.type))
      );
      dispatch(setReportIntegrationTypesSlice(types));
    }
  };

  const getProjectWiseStatues = async () => {
    const res = await userAPI.getAllReportProjects();
    res && dispatch(setReportProjectsSlice(res));
  };

  const reportToRender = (report: ReportData, inView: Boolean) => {
    switch (report.reportType) {
      case "TIME_SHEET":
        return <TimeSheetReport reportData={report} inView={inView} />;
      case "SPRINT_ESTIMATION":
        return <SprintEstimateReport reportData={report} inView={inView} />;
      case "TASK_LIST":
        return <TaskListReport reportData={report} inView={inView} />;
      case "SPRINT_REPORT":
        return <SprintReport reportData={report} inView={inView} />;
      case "SPRINT_TIMELINE":
        return <SprintTimelineReport reportData={report} inView={inView} />;
      default:
        return <div>No report found</div>;
    }
  };

  useEffect(() => {
    getIntegrationTypes();
    getSprintList();
    getProjectWiseStatues();
  }, []);

  return (
    <div className="flex flex-col gap-7 bg-[#EDEDF0] px-8 pt-2 pb-5">
      <div className="flex items-center justify-end pt-2">
        <PrimaryButton onClick={() => setIsModalOpen(true)}>
          <PlusIconSvg /> Add New Report
        </PrimaryButton>
      </div>
      {reportPageData?.reports?.map((report) => {
        return (
          <IntersectionWrapper
            {...{ report, reportToRender }}
            key={report.id}
          />
        );
      })}

      <GlobalModal title="Add New Report" {...{ isModalOpen, setIsModalOpen }}>
        <AddNewReport setIsModalOpen={setIsModalOpen} />
      </GlobalModal>
    </div>
  );
}

export const ReportIcons = {
  TIME_SHEET: <FaChartBar />,
  SPRINT_ESTIMATION: <LuGitCompare />,
  TASK_LIST: <MdChecklist />,
  SPRINT_REPORT: <FaChartGantt />,
  SPRINT_TIMELINE: <FaChartGantt />,
};
