import { IntegrationType } from "models/integration";
import { ReportPageTabs } from "models/reports";
import { useRouter } from "next/router";

import CalendarSelectorComponent from "@/components/common/topPanels/components/calendarSelector";
import SourceSelectorComponent from "@/components/common/topPanels/components/dataSouceSelector";
import ProjectSelectorComponent from "@/components/common/topPanels/components/projectSelector";
import SprintSelectorComponent from "@/components/common/topPanels/components/sprintSelector";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  projects?: any;
  setProjects?: any;
  calendarIds?: any;
  sprints?: number[];
  setSprints?: Function;
  setCalendarIds?: any;
  activeTab?: ReportPageTabs;


  setSelectedSource?: Function;
  selectedSource?: IntegrationType[];
};

const TypeDependentSection = ({
  sprints,
  projects,
  activeTab,
  setSprints,
  setProjects,
  calendarIds,
  setCalendarIds,
  selectedSource,
  setSelectedSource,
}: Props) => {
  const router = useRouter();
  const path = router.asPath;
  const reportSprintList = useAppSelector(
    (state: RootState) => state.projectList.reportSprintList
  );
  const taskSprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  const sprintList = path.includes("report")
    ? reportSprintList
    : taskSprintList;

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
            setSprints= {setSprints}
            className="w-full min-w-[210px]"
            mode="single"
          />
        ) : (
          <ProjectSelectorComponent
            projectIds={projects}
            setProjectIds={setProjects}
            setSprints= {setSprints}
            className="w-full min-w-[210px]"
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
            className="w-full min-w-[210px]"
          />
        ) : (
          <SprintSelectorComponent
            projectIds={projects}
            {...{ sprints, setSprints }}
            className="w-full min-w-[210px]"
          />
        ))}
      {![
        "Sprint Estimate",
        "Sprint Report",
        "Sprint View Timeline Report",
        "Scrum Report"
      ].includes(activeTab) &&
        showCalendarSelector && (
          <CalendarSelectorComponent
            key={Math.random()}
            mode="single"
            {...{ calendarIds, setCalendarIds }}
            className="w-full min-w-[210px]"
          />
        )}
    </>
  );
};

export default TypeDependentSection;
