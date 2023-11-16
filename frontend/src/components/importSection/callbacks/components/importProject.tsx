import { Button, message } from "antd";
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
    <div className="flex w-[500px] items-center justify-between rounded-md border-2 p-3 hover:bg-gray-50">
      <div className="flex flex-col">
        <div className=" font-bold">{project.projectName}</div>
        <div className="flex items-center gap-1">
          <div> Source :</div>
          <OpenLinkInNewTab>{project.source}</OpenLinkInNewTab>
        </div>
      </div>
      <div>
        <PrimaryButton onClick={() => importProjectTasks()}>
          <PlusIconSvg />
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ImportProject;
