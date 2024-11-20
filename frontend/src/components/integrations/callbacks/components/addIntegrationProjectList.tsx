import { Empty } from "antd";
import { ProjectDto } from "models/projects";

import ImportProject from "./importProject";
import { useEffect, useState } from "react";

type Props = {
  importableProjects: ProjectDto[];
  importIntegrationTasks: Function;
  queryData: String;
};

const AddIntegrationProjectList = ({
  importableProjects,
  importIntegrationTasks,
  queryData,
}: Props) => {
  const [importedProjects, setImportedProjects] = useState(importableProjects);

  function searchProject(queryData: String) {
    if (queryData === "") {
      setImportedProjects(importableProjects);
      return;
    }
    const filtered = importableProjects.filter((project) =>
      project.projectName.toLowerCase().includes(queryData.toLowerCase())
    );
    setImportedProjects(filtered);
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchProject(queryData);
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [queryData]);
  return (
    <div className="m-3 flex max-h-[300px] flex-col gap-2 overflow-y-auto">
      {importedProjects?.length > 0 ? (
        importedProjects?.map((project) => {
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
