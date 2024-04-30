import { ProjectDto } from "models/projects";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import OpenLinkInNewTab from "@/components/common/link/OpenLinkInNewTab";

type Props = {
  project: ProjectDto;
  importIntegrationTasks: Function;
};
const ImportProject = ({ project, importIntegrationTasks }: Props) => {
  const importProjectTasks = async () => {
    importIntegrationTasks(project);
  };
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between rounded-md border-2 p-3 hover:bg-gray-50">
      <div className="flex flex-col">
        <div className="font-bold whitespace-normal break-all">{project.projectName}</div>
        <div className="flex items-center">
          <OpenLinkInNewTab
            onClick={() => {
              project.source !== "T23" && window.open(project.source);
            }}
          >
            {project.source}
          </OpenLinkInNewTab>
        </div>
      </div>
      <div className="flex justify-center items-end max-w-min">
        <PrimaryButton onClick={() => importProjectTasks()}>
          <PlusIconSvg />
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ImportProject;
