import { Button } from "antd";
import { ProjectDto } from "models/projects";

import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";

type Props = {
  project: ProjectDto;
  deleteProject: Function;
};
const ImportedProject = ({ project, deleteProject }: Props) => {
  const deleteProjectTasks = async () => {
    deleteProject(project);
  };
  return (
    <div className="flex w-[500px] justify-between rounded-md border-2 p-3 hover:bg-gray-50">
      <div className="flex flex-col">
        <div className=" font-bold">{project.projectName}</div>
        <div className="flex items-center gap-1">
          <div> Source :</div>
          <div
            className="cursor-pointer text-sm font-normal text-blue-500"
            onClick={() => {
              window.open(project.source);
            }}
          >
            {project.source}
          </div>
        </div>
      </div>
      <div>
        <Button
          className="flex w-full gap-2 p-1"
          onClick={() => {
            deleteProjectTasks();
          }}
          type="ghost"
        >
          <DeleteIconSvg />
        </Button>
      </div>
    </div>
  );
};

export default ImportedProject;
