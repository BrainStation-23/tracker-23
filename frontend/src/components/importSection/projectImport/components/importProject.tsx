import { Button, message } from "antd";
import { userAPI } from "APIs";
import { ProjectDto } from "models/projects";
import { useRouter } from "next/router";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

type Props = {
  project: ProjectDto;
  setSpinning: Function;
};
const ImportProject = ({ project, setSpinning }: Props) => {
  const router = useRouter();
  const importProjectTasks = async () => {
    setSpinning(true);
    const res = await userAPI.importProject(project.id);
    if (res) {
      message.success(res.message);
      router.push("/projects");
    }
    setSpinning(false);
  };
  return (
    <div className="flex w-[500px] items-center justify-between rounded-md border-2 p-3 hover:bg-gray-50">
      <div className="flex flex-col">
        <div className=" font-bold">{project.projectName}</div>
        <div className="flex items-center gap-1">
          <div> Source :</div>
          <div className="text-sm font-normal text-blue-500">
            {project.source}
          </div>
        </div>
      </div>
      <div>
        <Button
          type="primary"
          className="flex items-center gap-2 py-3 text-[15px] text-white"
          onClick={() => importProjectTasks()}
        >
          <PlusIconSvg />
        </Button>
      </div>
    </div>
  );
};

export default ImportProject;
