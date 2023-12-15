import { Select, Typography } from "antd";
import { SprintDto } from "models/tasks";
import { useEffect } from "react";
import { GiSprint } from "react-icons/gi";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  sprints: any[];
  setSprints: Function;
  className?: string;
  projectIds?: number[];
  mode?: "multi" | "single";
};
type TagProps = {
  label: any;
  value: SprintDto;
  closable: any;
  onClose: any;
};
const SprintSelectorComponent = ({
  sprints,
  setSprints,
  className,
  projectIds,
  mode = "multi",
}: Props) => {
  const { Text } = Typography;
  const defaultValues: any = [];
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  const Options: { value: number; label: string; key: number }[] = [];
  if (projectIds) {
    const filteredSprintList = sprintList.filter((sprint) =>
      projectIds.includes(sprint.projectId)
    );
    for (const st of filteredSprintList) {
      Options.push({
        value: st.id,
        label: st.name,
        key: st.id,
      });
    }
  } else
    for (const st of sprintList) {
      Options.push({
        value: st.id,
        label: st.name,
        key: st.id,
      });
    }

  if (Options?.length === 0) {
    for (const val of defaultValues) {
      Options.push({
        value: val.id,
        label: val.name,
        key: val.id,
      });
    }
  }
  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <div
        onClick={onClose}
        className="m-1 flex w-max cursor-pointer items-center gap-1 rounded border-[1px] border-secondary px-2 py-0.5 text-xs font-medium text-black"
      >
        {sprints.length > 1 ? (
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
    mode !== "single" &&
      sprints?.forEach((st) => {
        for (const option of Options) {
          if (option.label === JSON.parse(st).label)
            tmpArray.push(option.value);
        }
      });
  }, [sprints]);
  if (Options.length > 0)
    return (
      <div
        className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
          className ? className : ""
        }`}
      >
        <GiSprint size={24} />
        {mode === "single" ? (
          <Select
            placeholder="Select Sprint"
            tagRender={(props) => tagRender(props)}
            value={sprints[0] ? sprints : null}
            className="w-full"
            showArrow
            maxTagCount={1}
            options={Options}
            onChange={(value) => {
              console.log("🚀 ~ file: sprintSelector.tsx:123 ~ value:", value);
              setSprints(value);
            }}
          />
        ) : (
          <Select
            placeholder="Select Sprint"
            mode="multiple"
            tagRender={(props) => tagRender(props)}
            value={sprints}
            defaultValue={[]}
            className="w-full"
            showArrow
            maxTagCount={1}
            options={Options}
            onChange={(value) => {
              setSprints(value);
            }}
          />
        )}
      </div>
    );
};

export default SprintSelectorComponent;
