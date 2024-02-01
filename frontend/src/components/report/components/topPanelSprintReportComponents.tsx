import { ReportPageTabs } from "models/reports";
import { useEffect } from "react";

import ProjectSelectorComponent from "@/components/common/topPanels/components/projectSelector";
import SprintSelectorComponent from "@/components/common/topPanels/components/sprintSelector";
import DateRangePicker from "@/components/common/datePicker";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useRouter } from "next/router";

type Props = {
  sprint: number;
  setSprint: Function;
  project: number;
  setProject: Function;
};
const TopPanelSprintReportComponents = ({
  sprint,
  setSprint,
  project,
  setProject,
}: Props) => {
  console.log("---------------------------:", sprint, project);
  const router = useRouter();
  const path = router.asPath;

  const sprintList = path.includes("report")
    ? useAppSelector((state: RootState) => state.projectList.reportSprintList)
    : useAppSelector((state: RootState) => state.tasksSlice.sprintList);

  const checkSprint = () => {
    const selectedSprint = sprintList.filter(
      (sp) => sp.id === sprint && sp.projectId === project
    );
    return selectedSprint.length !== 1;
  };
  useEffect(() => {
    checkSprint() && setSprint();
  }, [project]);
  return (
    <>
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
