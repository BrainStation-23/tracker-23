import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortPriorityIconSvg from "@/assets/svg/sortIcons/SortPriorityIconSvg";
import { Select } from "antd";
import {
  PriorityBGColorEnum,
  PriorityBorderColorEnum,
  taskPriorityEnum,
} from "utils/constants";
type TagProps = {
  label: any;
  value: "MEDIUM" | "HIGH" | "LOW";
  closable: any;
  onClose: any;
};
type Props = { priority: string[]; setPriority: Function };
const PrioritySelectorComponent = ({ priority, setPriority }: Props) => {
  const tagRender = (props: TagProps) => {
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
        className="m-1 flex w-min cursor-pointer items-center gap-1 rounded px-2 text-black"
        onClick={onClose}
      >
        {taskPriorityEnum[value]} <CrossIconSvg />
      </div>
    );
  };
  return (
    <div
      key={Math.random()}
      className={`flex w-full items-center gap-2 text-sm font-normal text-black `}
      // style={{
      //   color: active === "Sort" ? "#00A3DE" : "black",
      //   // backgroundColor: "#00A3DE",
      // }}
      // onClick={() => setActive("Sort")}
    >
      <SortPriorityIconSvg />
      {/* <span className="font-normal">Priority</span> */}
      <Select
        placeholder="Select Priority"
        mode="multiple"
        // style={{ width: 120 }}
        className="w-full"
        showArrow
        value={priority}
        tagRender={tagRender}
        options={[
          { value: "HIGH", label: "High" },
          { value: "MEDIUM", label: "Medium" },
          { value: "LOW", label: "Low" },
        ]}
        onChange={(value) => setPriority(value)}
      />
    </div>
  );
};

export default PrioritySelectorComponent;
