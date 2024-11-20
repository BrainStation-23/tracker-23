import { ProjectDto } from "models/projects";
import AddIntegrationProjectList from "./addIntegrationProjectList";

type Props = {
  newIntegrationProjects: ProjectDto[];
  importIntegrationTasks: Function;
  queryData : String
};
const NewIntegrationProjectImportComponent = ({
  newIntegrationProjects,
  importIntegrationTasks,
  queryData
}: Props) => {
  return (
    <AddIntegrationProjectList
      importableProjects={newIntegrationProjects.filter(
        (project) => !project.integrated
      )}
      importIntegrationTasks={importIntegrationTasks}
      queryData={queryData}
    />
  );
};

export default NewIntegrationProjectImportComponent;
