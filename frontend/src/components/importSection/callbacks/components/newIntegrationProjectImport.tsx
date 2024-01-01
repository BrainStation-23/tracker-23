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
  // TODO: API has been updated and `newIntegrationProjects` should contain only  `ProjectDto[]`
  // TODO: So the commented code below should be removed
  // TODO: If required any modifications we should do it outside of this component
  // const allProjects = newIntegrationProjects
  //   .map((tmp: any) => tmp.projects)
  //   .flat();
  // const importableProjects = allProjects.filter(
  //   (project: any) => !project.integrated
  // );

  return (
    <AddIntegrationProjectList
      importableProjects={newIntegrationProjects.filter(
        (project) => !project.integrated
      )}
      importIntegrationTasks={importIntegrationTasks}
    />
  );
};

export default NewIntegrationProjectImportComponent;
