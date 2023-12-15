import { Select, Typography } from "antd";
import { StatusDto } from "models/tasks";
import { useEffect } from "react";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortStatusIconSvg from "@/assets/svg/sortIcons/SortStatusIconSvg";
import { useAppSelector } from "@/storage/redux";
import { Project, StatusType } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";

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
  projectIds,
  setProjectIds,
  className,
  mode = "multi",
}: Props) => {
  const { Text } = Typography;

  const defaultValues: any = [
    // { name: "To Do", statusCategoryName: "TO_DO" },
    // { name: "In Progress", statusCategoryName: "IN_PROGRESS" },
  ];
  const projects = useAppSelector(
    (state: RootState) => state.projectList.projects
  );
  const Options = projects
    ? projects?.map((project) => {
        return {
          value: project.id,
          label: project.projectName,
        };
      })
    : [];
  if (Options?.length === 0) {
    defaultValues.forEach((val: Project) => {
      Options.push({
        value: val.id,
        label: val.projectName,
      });
    });
  }
  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;
    const statusObj: StatusType = value && JSON.parse(value);

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
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
  useEffect(() => {
    const tmpArray: any[] = [];
    projectIds?.map((projectId) => {
      Options?.map((option) => {
        if (option.value === projectId) tmpArray.push(option.value);
      });
    });
  }, [projectIds]);
  return (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <SortStatusIconSvg />
      {mode == "single" ? (
        <Select
          placeholder="Select Project"
          tagRender={(props) => tagRender(props)}
          value={projectIds[0] ? projectIds : null}
          className="w-full"
          showArrow
          maxTagCount={1}
          options={Options}
          onChange={(value) => {
            setProjectIds(value);
          }}
        />
      ) : (
        <Select
          placeholder="Select Project"
          mode="multiple"
          tagRender={(props) => tagRender(props)}
          value={projectIds}
          className="w-full"
          showArrow
          maxTagCount={1}
          options={Options}
          onChange={(value) => {
            setProjectIds(value);
          }}
        />
      )}
    </div>
  );
};

export default ProjectSelectorComponent;
