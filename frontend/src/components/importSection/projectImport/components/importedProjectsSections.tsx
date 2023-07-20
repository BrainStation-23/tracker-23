import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import ImportedProject from "./importedProject";
import { useEffect } from "react";
import { ProjectDto } from "models/projects";
import { Empty } from "antd";

type Props = {
  allProjects: ProjectDto[];
  deleteProject: Function;
};
const ImportedProjectsSection = ({ allProjects, deleteProject }: Props) => {
  const importedProtects = allProjects?.filter(
    (project: any) => project.integrated
  );

  return (
    <div className="flex max-w-[1100px] flex-wrap gap-3">
      {importedProtects?.length > 0 ? (
        importedProtects?.map((project) => (
          <ImportedProject {...{ project, deleteProject }} key={project.id} />
        ))
      ) : (
        <Empty description="No Imported Projects" className="w-full py-2" />
      )}
    </div>
  );
};

export default ImportedProjectsSection;
