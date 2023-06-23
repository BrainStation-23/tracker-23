import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import { Button } from "antd";
type Props = {
  projectName: string;
  source: string;
};
const ImportProject = ({
  projectName = "Project Name",
  source = "    https://pm23.atlassian.net/jira/software/projects/T23",
}: Props) => {
  return (
    <div className="flex w-[500px] items-center justify-between rounded-md border-2 p-3 hover:bg-gray-50">
      <div className="flex flex-col">
        <div className=" font-bold">{projectName}</div>
        <div className="flex items-center gap-1">
          <div> Source :</div>
          <div
            className="text-sm font-normal text-blue-500"
            // onClick={() => {
            //   window.open(data.site);
            // }}
          >
            {source}
          </div>
        </div>
      </div>
      <div>
        <Button
          type="primary"
          className="flex items-center gap-2 py-3 text-[15px] text-white"
          // onClick={() => setIsModalOpen(true)}
        >
          <PlusIconSvg />
        </Button>
      </div>
    </div>
  );
};

export default ImportProject;
