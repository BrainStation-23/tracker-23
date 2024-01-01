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
  activeTab: ReportPageTabs;
  selectedSource?: IntegrationType[];
  setSelectedSource?: Function;
  projects?: any;
  setProjects?: any;
  calendarIds: any;
  setCalendarIds: any;
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
      <SourceSelectorComponent {...{ selectedSource, setSelectedSource }} />

      {showProjectSelector && (
        <ProjectSelectorComponent
          projectIds={projects}
          setProjectIds={setProjects}
          className="w-[210px]"
        />
      )}
      {(activeTab === "Sprint Estimate" || activeTab === "Task List") &&
        selectedSource?.includes("JIRA") &&
        showProjectSelector &&
        sprintList.length > 0 && (
          <SprintSelectorComponent
            projectIds={projects}
            {...{ sprints, setSprints }}
            className="w-[210px]"
          />
        )}
      {(activeTab === "Sprint Estimate" || activeTab === "Task List") &&
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
