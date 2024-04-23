import { ProjectDto } from "models/projects";

import ImportProject from "./importProject";

type Props = {
  importableProjects: ProjectDto[];
  setSpinning: Function;
};
const AddProjectList = ({ importableProjects, setSpinning }: Props) => {
  return (
    <div className="m-3 flex max-h-[300px] flex-col gap-2 overflow-y-auto">
      {importableProjects?.map((project) => {
        return <ImportProject key={project.id} {...{ project, setSpinning }} />;
      })}
    </div>
  );
};

export default AddProjectList;
