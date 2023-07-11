import { ProjectDto } from "models/projects";
import AddIntegrationProjectList from "./addIntegrationProjectList";

type Props = {
  newIntegrationProjects: ProjectDto[];
  importIntegrationTasks: Function;
};
const NewIntegrationProjectImportComponent = ({
  newIntegrationProjects,
  importIntegrationTasks,
}: Props) => {
  const allProjects = newIntegrationProjects
    .map((tmp: any) => tmp.projects)
    .flat();
  const importableProjects = allProjects.filter(
    (project: any) => !project.integrated
  );

  return (
    <>
      <AddIntegrationProjectList
        {...{ importableProjects, importIntegrationTasks }}
      />
    </>
  );
};

export default NewIntegrationProjectImportComponent;
