import SortProgressIconSvg from "@/assets/svg/sortIcons/SortProgressIconSvg";
import { Select } from "antd";
type Props = { priority: string; setPriority: Function };
const PrioritySelectorComponent = ({ priority, setPriority }: Props) => {
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
      <SortProgressIconSvg />
      {/* <span className="font-normal">Priority</span> */}
      <Select
        defaultValue="Priority"
        style={{ width: 120 }}
        value={priority}
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
