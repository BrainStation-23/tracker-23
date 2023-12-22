import { Select, Space, Typography } from "antd";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortPriorityIconSvg from "@/assets/svg/sortIcons/SortPriorityIconSvg";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useRouter } from "next/router";

type TagProps = {
  label: any;
  value: string;
  closable: any;
  onClose: any;
};
type Props = { priority: string[]; setPriority: Function; className?: string };
const PrioritySelectorComponent = ({
  priority,
  setPriority,
  className,
}: Props) => {
  const router = useRouter();
  const path = router.asPath;

  const priorityNames = path.includes("report")
    ? useAppSelector(
        (state: RootState) => state.projectList.reportProjectPriorityNames
      )
    : useAppSelector((state: RootState) => state.prioritySlice.priorityNames);

  useAppSelector((state: RootState) => state.prioritySlice.priorityNames);

  const priorities = path.includes("report")
    ? useAppSelector(
        (state: RootState) => state.projectList.reportProjectPriorities
      )
    : useAppSelector((state: RootState) => state.prioritySlice.priorities);

  const tagRender = (props: TagProps) => {
    const { Text } = Typography;

    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const tmpPriority = priorities.find((priority) => priority.name == value);
    return (
      <div
        style={{
          border: `1px solid ${tmpPriority.color}`,
        }}
        className="m-1 flex w-min  cursor-pointer items-center gap-1 rounded px-1 text-black"
        onClick={onClose}
      >
        {priority.length > 1 ? (
          <div className="flex w-max max-w-[30px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {tmpPriority.name}
            </Text>
          </div>
        ) : (
          <div className="flex w-max max-w-[90px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {tmpPriority.name}
            </Text>
          </div>
        )}
        <CrossIconSvg />
      </div>
    );
  };

  return (
    <div
      key={Math.random()}
      className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <SortPriorityIconSvg />
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          placeholder="Select Priority"
          mode="multiple"
          className="w-full"
          showArrow
          value={priority}
          tagRender={tagRender}
          maxTagCount={1}
          options={priorityNames?.map((priorityName) => {
            return { value: priorityName, label: priorityName };
          })}
          onChange={(value) => setPriority(value)}
        />
      </Space>
    </div>
  );
};

export default PrioritySelectorComponent;
