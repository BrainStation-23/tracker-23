import { ReportPageTabs } from "models/reports";
import { useEffect } from "react";

import ProjectSelectorComponent from "@/components/common/topPanels/components/projectSelector";
import SprintSelectorComponent from "@/components/common/topPanels/components/sprintSelector";
import DateRangePicker from "@/components/datePicker";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  sprint: any;
  setSprint: Function;
  dateRange: any;
  setDateRange: Function;
  activeTab: ReportPageTabs;
  project: number;
  setProject: Function;
};
const TopPanelSprintReportComponents = ({
  sprint,
  setSprint,
  dateRange,
  setDateRange,
  activeTab,
  project,
  setProject,
}: Props) => {
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  useEffect(() => {
    setSprint && setSprint();
  }, [project]);
  return (
    <>
      <DateRangePicker
        selectedDate={dateRange}
        setSelectedDate={setDateRange}
      />
      <ProjectSelectorComponent
        projectIds={[project]}
        setProjectIds={setProject}
        className="w-[210px]"
        mode="single"
      />
      {project && sprintList.length > 0 && (
        <SprintSelectorComponent
          projectIds={[project]}
          sprints={[sprint]}
          setSprints={setSprint}
          mode="single"
          className="w-[210px]"
        />
      )}
    </>
  );
};

export default TopPanelSprintReportComponents;
