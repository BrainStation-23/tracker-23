import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortStatusIconSvg from "@/assets/svg/sortIcons/SortStatusIconSvg";
import { Select } from "antd";
import { StatusDto } from "models/tasks";
import {
  statusBGColorEnum,
  statusBorderColorEnum,
  taskStatusEnum,
} from "utils/constants";
type Props = {
  status: string[];
  setStatus: Function;
};
type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};
const StatusSelectorComponent = ({ status, setStatus }: Props) => {
  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <div
        style={{
          backgroundColor: statusBGColorEnum[value],
          border: `1px solid ${statusBorderColorEnum[value]}`,
          borderRadius: "36px",
        }}
        onClick={onClose}
        className="m-1 flex w-max cursor-pointer items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
      >
        <div
          className="flex h-2 w-2 items-center rounded-full"
          style={{
            backgroundColor: statusBorderColorEnum[value],
          }}
        />
        <div>{taskStatusEnum[value]}</div> <CrossIconSvg />
      </div>
    );
  };
  return (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black `}
      // style={{
      //   color: active === "Sort" ? "#00A3DE" : "black",
      //   // backgroundColor: "#00A3DE",
      // }}
      // onClick={() => setActive("Sort")}
    >
      <SortStatusIconSvg />
      {/* <span className="font-normal">Status</span> */}
      <Select
        placeholder="Select Status"
        mode="multiple"
        tagRender={tagRender}
        value={status}
        // style={{ width: 120 }}
        className="w-full"
        showArrow
        options={[
          { value: "TODO", label: "Todo" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "DONE", label: "Done" },
        ]}
        onChange={(value) => setStatus(value)}
      />
    </div>
  );
};

export default StatusSelectorComponent;
