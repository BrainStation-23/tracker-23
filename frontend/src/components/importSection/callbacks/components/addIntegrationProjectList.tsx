import { ProjectDto } from "models/projects";
import ImportProject from "./importProject";
import { Empty } from "antd";

type Props = {
  importableProjects: ProjectDto[];
  importIntegrationTasks: Function;
};

const AddIntegrationProjectList = ({
  importableProjects,
  importIntegrationTasks,
}: Props) => {
  return (
    <div className="m-3 flex max-h-[300px] flex-col gap-2 overflow-y-auto">
      {importableProjects?.length > 0 ? (
        importableProjects?.map((project) => {
          return (
            <ImportProject
              key={project.id}
              {...{ project, importIntegrationTasks }}
            />
          );
        })
      ) : (
        <Empty description="No Importable Projects" className="py-2" />
      )}
    </div>
  );
};

export default AddIntegrationProjectList;
