import { Select, Tooltip, Typography } from "antd";
import { StatusDto } from "models/tasks";
import { useRouter } from "next/router";
import { LuFolderOpen } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import classNames from "classnames";

const { Text } = Typography;

type Props = {
  projectIds: number[];
  setProjectIds: Function;
  className?: string;
  mode?: "multi" | "single";
  readonly?: boolean;
};

export default function ProjectSelectorComponent({
  className,
  projectIds,
  setProjectIds,
  mode = "multi",
  readonly,
}: Props) {
  const router = useRouter();
  const path = router.asPath;

  const reportProjects = useAppSelector(
    (state: RootState) => state.projectList.reportProjects
  );
  const projectListProjects = useAppSelector(
    (state: RootState) => state.projectList.projects
  );

  const projects = (
    path.includes("report") ? reportProjects : projectListProjects
  )?.filter((project) => project.integrationType !== "OUTLOOK");

  const selectOptions = projects
    ? projects?.map((project) => {
        return {
          value: project.id,
          label: project.projectName,
        };
      })
    : [];

  return readonly ? (
    <div
      className={classNames("flex items-center justify-center gap-1", {
        ["hidden"]: !projectIds || !(projectIds?.length > 0),
      })}
    >
      <Tooltip title="Project(s)">
        <LuFolderOpen size={16} />
      </Tooltip>
      <div>
        {projectIds.length} {projectIds.length === 1 ? "Project" : "Projects"}
      </div>
    </div>
  ) : (
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
}

type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};

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
