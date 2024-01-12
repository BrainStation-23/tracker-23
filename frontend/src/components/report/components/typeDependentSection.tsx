import { IntegrationType } from "models/integration";
import { ReportPageTabs } from "models/reports";
import { useRouter } from "next/router";

import CalendarSelectorComponent from "@/components/common/topPanels/components/calendarSelector";
import SourceSelectorComponent from "@/components/common/topPanels/components/dataSouceSelector";
import ProjectSelectorComponent from "@/components/common/topPanels/components/projectSelector";
import SprintSelectorComponent from "@/components/common/topPanels/components/sprintSelector";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { ReportConfig } from "@/storage/redux/reportsSlice";

const TypeDependentSection = ({
  config,
  activeTab,
  selectedSource,
  setSelectedSource,
  projects,
  setProjects,
  sprints,
  setSprints,
  calendarIds,
  setCalendarIds,
}: {
  config?: ReportConfig;
  activeTab?: ReportPageTabs;
  selectedSource?: IntegrationType[];
  setSelectedSource?: Function;
  projects?: any;
  setProjects?: any;
  calendarIds?: any;
  setCalendarIds?: any;
  sprints: number[];
  setSprints: Function;
}) => {
  const router = useRouter();
  const path = router.asPath;
  const sprintList = path.includes("report")
    ? useAppSelector((state: RootState) => state.projectList.reportSprintList)
    : useAppSelector((state: RootState) => state.tasksSlice.sprintList);
  console.log("🚀 ~ ", path.includes("report"));

  const showProjectSelector =
    selectedSource?.length > 0 ? selectedSource.includes("JIRA") : true;
  const showCalendarSelector =
    selectedSource?.length > 0 ? selectedSource.includes("OUTLOOK") : true;

  return (
    <>
      {!["Sprint Estimate", "Sprint Report"].includes(activeTab) && (
        <SourceSelectorComponent {...{ selectedSource, setSelectedSource }} />
      )}

      {(["Sprint Estimate", "Sprint Report"].includes(activeTab) ||
        showProjectSelector) && (
        <ProjectSelectorComponent
          projectIds={projects}
          setProjectIds={setProjects}
          className="w-[210px]"
        />
      )}
      {(["Sprint Estimate", "Sprint Report"].includes(activeTab) ||
        (showProjectSelector && activeTab === "Task List")) &&
        sprintList.length > 0 && (
          <SprintSelectorComponent
            projectIds={projects}
            {...{ sprints, setSprints }}
            className="w-[210px]"
          />
        )}
      {["Sprint Estimate", "Sprint Report"].includes(activeTab) &&
        showCalendarSelector &&
        activeTab === "Task List" && (
          <CalendarSelectorComponent
            key={Math.random()}
            {...{ calendarIds, setCalendarIds }}
            className="w-[210px]"
          />
        )}
    </>
  );
};

export default TypeDependentSection;
