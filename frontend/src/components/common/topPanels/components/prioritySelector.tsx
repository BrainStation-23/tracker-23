import { Select, Space, Typography } from "antd";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortPriorityIconSvg from "@/assets/svg/sortIcons/SortPriorityIconSvg";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useRouter } from "next/router";
const { Text } = Typography;

type Props = { priority: string[]; setPriority: Function; className?: string };
export default function PrioritySelectorComponent({
  priority,
  setPriority,
  className,
}: Props) {
  const router = useRouter();
  const path = router.asPath;

  const reportProjectPriorityNames = useAppSelector(
    (state: RootState) => state.projectList.reportProjectPriorityNames
  );

  const prioritySlicePriorityNames = useAppSelector(
    (state: RootState) => state.prioritySlice.priorityNames
  );

  const priorityNames = path.includes("report")
    ? reportProjectPriorityNames
    : prioritySlicePriorityNames;

  return (
    <div
      key={Math.random()}
      className={`flex w-full min-w-[210px] items-center gap-2 text-sm font-normal text-black ${
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
          tagRender={(value) => TagRender({ ...value, priority })}
          maxTagCount={1}
          options={priorityNames?.map((priorityName) => {
            return { value: priorityName, label: priorityName };
          })}
          onChange={(value) => setPriority(value)}
        />
      </Space>
    </div>
  );
}

type TagProps = {
  label: any;
  value: string;
  closable: any;
  onClose: any;
  priority: string[];
};

export function TagRender(props: TagProps) {
  const router = useRouter();
  const path = router.asPath;
  const { label, value, onClose, priority } = props;
  const reportProjectPriorities = useAppSelector(
    (state: RootState) => state.projectList.reportProjectPriorities
  );

  const prioritySlicePriorities = useAppSelector(
    (state: RootState) => state.prioritySlice.priorities
  );

  const priorities = path.includes("report")
    ? reportProjectPriorities
    : prioritySlicePriorities;
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
}
