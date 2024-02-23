import { Select, Typography } from "antd";
import { StatusDto } from "models/tasks";
import { useRouter } from "next/router";
import { LuFolderOpen } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { useAppSelector } from "@/storage/redux";
import { Project } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";

const { Text } = Typography;

type Props = {
  projectIds: number[];
  setProjectIds: Function;
  className?: string;
  mode?: "multi" | "single";
};
type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};
const ProjectSelectorComponent = ({
  className,
  projectIds,
  setProjectIds,
  mode = "multi",
}: Props) => {
  const router = useRouter();
  const path = router.asPath;

  const projects = (
    path.includes("report")
      ? useAppSelector((state: RootState) => state.projectList.reportProjects)
      : useAppSelector((state: RootState) => state.projectList.projects)
  )?.filter((project) => project.integrationType !== "OUTLOOK");

  const selectOptions = projects
    ? projects?.map((project) => {
        return {
          value: project.id,
          label: project.projectName,
        };
      })
    : [];

  return (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <LuFolderOpen size={20} />
      {mode == "single" ? (
        <Select
          showArrow
          maxTagCount={1}
          options={selectOptions}
          className="w-full"
          placeholder="Select Project"
          value={projectIds[0] ? projectIds : null}
          onChange={(value) => setProjectIds(value)}
          tagRender={(props) => tagRender(props, projectIds)}
        />
      ) : (
        <Select
          showArrow
          maxTagCount={1}
          mode="multiple"
          options={selectOptions}
          value={projectIds}
          className="w-full"
          placeholder="Select Project"
          onChange={(value) => setProjectIds(value)}
          tagRender={(props) => tagRender(props, projectIds)}
        />
      )}
    </div>
  );
};

export default ProjectSelectorComponent;

const tagRender = (props: TagProps, projectIds: number[]) => {
  const { label, onClose } = props;
  return (
    <div
      onClick={onClose}
      className="m-1 flex w-max cursor-pointer items-center gap-1 rounded border-[1px] border-secondary px-2 py-0.5 text-xs font-medium text-black"
    >
      {projectIds.length > 1 ? (
        <div className="flex w-max max-w-[30px] items-center text-sm">
          <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
            {label}
          </Text>
        </div>
      ) : (
        <div className="flex w-max max-w-[100px] items-center text-sm">
          <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
            {label}
          </Text>
        </div>
      )}
      <CrossIconSvg />
    </div>
  );
};
