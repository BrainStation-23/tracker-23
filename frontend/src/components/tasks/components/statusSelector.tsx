import SortStatusIconSvg from "@/assets/svg/sortIcons/SortStatusIconSvg";
import { Select } from "antd";
type Props = {
  status: string[];
  setStatus: Function;
};
const StatusSelectorComponent = ({ status, setStatus }: Props) => {
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
        value={status}
        style={{ width: 120 }}
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
