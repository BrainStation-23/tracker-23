import { IntegrationType } from "models/integration";
import { ReportPageTabs } from "models/reports";
import { useRouter } from "next/router";

import CalendarSelectorComponent from "@/components/common/topPanels/components/calendarSelector";
import SourceSelectorComponent from "@/components/common/topPanels/components/dataSouceSelector";
import ProjectSelectorComponent from "@/components/common/topPanels/components/projectSelector";
import SprintSelectorComponent from "@/components/common/topPanels/components/sprintSelector";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

const TypeDependentSection = ({
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

  const showProjectSelector =
    selectedSource?.length > 0 ? selectedSource.includes("JIRA") : true;
  const showCalendarSelector =
    selectedSource?.length > 0 ? selectedSource.includes("OUTLOOK") : true;

  return (
    <>
      {![
        "Sprint Estimate",
        "Sprint Report",
        "Sprint View Timeline Report",
      ].includes(activeTab) && (
        <SourceSelectorComponent {...{ selectedSource, setSelectedSource }} />
      )}

      {([
        "Sprint Estimate",
        "Sprint Report",
        "Sprint View Timeline Report",
      ].includes(activeTab) ||
        showProjectSelector) &&
        (activeTab === "Sprint View Timeline Report" ? (
          <ProjectSelectorComponent
            projectIds={projects}
            setProjectIds={setProjects}
            className="w-[210px]"
            mode="single"
          />
        ) : (
          <ProjectSelectorComponent
            projectIds={projects}
            setProjectIds={setProjects}
            className="w-[210px]"
          />
        ))}
      {([
        "Sprint Estimate",
        "Sprint Report",
        "Sprint View Timeline Report",
      ].includes(activeTab) ||
        (showProjectSelector && activeTab === "Task List")) &&
        sprintList.length > 0 &&
        (activeTab === "Sprint Report" ||
        activeTab === "Sprint View Timeline Report" ? (
          <SprintSelectorComponent
            mode="single"
            projectIds={projects}
            {...{ sprints, setSprints }}
            className="w-[210px]"
          />
        ) : (
          <SprintSelectorComponent
            projectIds={projects}
            {...{ sprints, setSprints }}
            className="w-[210px]"
          />
        ))}
      {![
        "Sprint Estimate",
        "Sprint Report",
        "Sprint View Timeline Report",
      ].includes(activeTab) &&
        showCalendarSelector && (
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
