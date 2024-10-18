import { Select, Typography } from "antd";
import { StatusDto } from "models/tasks";
import { useRouter } from "next/router";
import { LuFolderOpen } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

const { Text } = Typography;

type Props = {
  projectIds: number[];
  setProjectIds: Function;
  setSprints?: Function;
  className?: string;
  mode?: "multi" | "single";
};

export default function ProjectSelectorComponent({
  className,
  projectIds,
  setProjectIds,
  setSprints,
  mode = "multi",
}: Props) {
  const router = useRouter();
  const path = router.asPath;
  const reportInEdit = useAppSelector(
    (state: RootState) => state.reportsSlice.reportInEdit
  );

  const reportProjects = useAppSelector(
    (state: RootState) => state.projectList.reportProjects
  );
  const projectListProjects = useAppSelector(
    (state: RootState) => state.projectList.projects
  );

  const projects = (
    path.includes("report") ? reportProjects : projectListProjects
  )?.filter((project) => project.integrationType !== "OUTLOOK");

  const filteredData =
    reportInEdit.reportType === "SPRINT_TIMELINE"
      ? projects
      : // ? projects.filter((el) => el.integration?.type === "JIRA")
        projects;

  const selectOptions = filteredData
    ? filteredData?.map((project) => {
        return {
          value: project.id,
          label: project.projectName,
        };
      })
    : [];

  const handleProjectSelection = (projectIds: number[]) => {
    if(projectIds.length == 0){
      setSprints(null)
    }
    setProjectIds(projectIds)
  }

  return (
    <div
      className={`flex w-full min-w-[210px] items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <LuFolderOpen size={20} />
      {mode == "single" ? (
        <Select
          maxTagCount={1}
          options={
            reportInEdit.reportType === "SPRINT_TIMELINE"
              ? selectOptions.filter((el) => el)
              : selectOptions
          }
          className="w-full"
          placeholder="Select Project"
          value={projectIds[0] ? projectIds : null}
          onChange={(value) => handleProjectSelection(value)}
          tagRender={(props) => tagRender(props, projectIds)}
        />
      ) : (
        <Select
          maxTagCount={1}
          mode="multiple"
          options={selectOptions}
          value={projectIds}
          className="w-full"
          placeholder="Select Project"
          onChange={(value) => handleProjectSelection(value)}
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
