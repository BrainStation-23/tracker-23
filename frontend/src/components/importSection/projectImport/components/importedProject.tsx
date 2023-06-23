import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import { Button } from "antd";

const ImportedProject = () => {
  return (
    <div className="flex w-[500px] justify-between rounded-md border-2 p-3 hover:bg-gray-50">
      <div className="flex flex-col">
        <div className=" font-bold">Project Name</div>
        <div className="flex items-center gap-1">
          <div> Source :</div>
          <div
            className="text-sm font-normal text-blue-500"
            // onClick={() => {
            //   window.open(data.site);
            // }}
          >
            https://pm23.atlassian.net/jira/software/projects/T23
          </div>
        </div>
      </div>
      <div>
        <Button
          className="flex w-full gap-2 p-1"
          // onClick={() => {
          //   deleteTask(task.id);
          // }}
          type="ghost"
        >
          <DeleteIconSvg />
        </Button>
      </div>
    </div>
  );
};

export default ImportedProject;
