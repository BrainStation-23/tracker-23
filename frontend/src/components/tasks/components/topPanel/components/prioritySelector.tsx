import { Select, Space, Typography } from "antd";
import { PriorityDto } from "models/tasks";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  taskPriorityEnum,
} from "utils/constants";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortPriorityIconSvg from "@/assets/svg/sortIcons/SortPriorityIconSvg";

type TagProps = {
  label: any;
  value: PriorityDto;
  closable: any;
  onClose: any;
};
type Props = { priority: string[]; setPriority: Function; className?: string };
const PrioritySelectorComponent = ({
  priority,
  setPriority,
  className,
}: Props) => {
  const tagRender = (props: TagProps) => {
    const { Text } = Typography;

    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <div
        style={{
          backgroundColor: PriorityBGColorEnum[value],
          border: `1px solid ${PriorityBorderColorEnum[value]}`,
        }}
        className="m-1 flex w-min  cursor-pointer items-center gap-1 rounded px-2 text-black"
        onClick={onClose}
      >
        {priority.length > 1 ? (
          <div className="flex w-max max-w-[30px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {taskPriorityEnum[value]}
            </Text>
          </div>
        ) : (
          <div className="flex w-max max-w-[90px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {taskPriorityEnum[value]}
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
          // style={{ width: 120 }}
          className="w-full"
          showArrow
          value={priority}
          tagRender={tagRender}
          maxTagCount={1}
          options={[
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
          ]}
          onChange={(value) => setPriority(value)}
        />
      </Space>
    </div>
  );
};

export default PrioritySelectorComponent;
