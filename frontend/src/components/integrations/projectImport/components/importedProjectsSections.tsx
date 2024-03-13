import { Card, Empty } from "antd";
import { ProjectDto } from "models/projects";

import ImportedProject from "./importedProject";

type Props = {
  projects: ProjectDto[];
  deleteProject: Function;
  title: string;
};

const ImportedProjectsSection = ({ projects, deleteProject, title }: Props) => {
  if (!(projects?.length > 0)) return null;
  return (
    <Card
      style={{
        backgroundColor: "#F5F5F5",
      }}
    >
      <div className="flex w-full flex-col gap-4">
        <div className="text-xl font-bold">{title}</div>
        <div className="flex w-full gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ImportedProject
                {...{ project, deleteProject }}
                key={project.id}
              />
            ))
          ) : (
            <Empty description="No Imported Projects" className="w-full py-2" />
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImportedProjectsSection;
