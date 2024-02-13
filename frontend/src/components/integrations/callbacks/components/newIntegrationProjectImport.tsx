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
