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
  sprints: number[];
  setSprints: Function;
  setCalendarIds?: any;
  activeTab?: ReportPageTabs;
  setSelectedSource?: Function;
  selectedSource?: IntegrationType[];
  readonly?: boolean;
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
  readonly,
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
        <SourceSelectorComponent
          {...{ selectedSource, setSelectedSource, readonly }}
        />
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
            readonly={readonly}
          />
        ) : (
          <ProjectSelectorComponent
            projectIds={projects}
            setProjectIds={setProjects}
            className="w-[210px]"
            readonly={readonly}
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
            readonly={readonly}
          />
        ) : (
          <SprintSelectorComponent
            projectIds={projects}
            {...{ sprints, setSprints }}
            className="w-[210px]"
            readonly={readonly}
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
            {...{ calendarIds, setCalendarIds, readonly }}
            className="w-[210px]"
          />
        )}
    </>
  );
};

export default TypeDependentSection;
