import { Dropdown, MenuProps } from "antd";
import { useState } from "react";
import {
  statusBGColorEnum,
  statusBorderColorEnum,
  taskStatusEnum,
} from "utils/constants";

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Props = { children: any; selectedStatus: "TODO" | "IN_PROGRESS" | "DONE" };
const StatusDropdownComponent = ({ children, selectedStatus }: Props) => {
  const [dropDownOpen, setDropdownOpen] = useState(false);

  const statuses: Status[] = ["TODO", "IN_PROGRESS", "DONE"];
  const items: MenuProps["items"] = statuses.map((status) =>
    statusComponent(status, selectedStatus)
  );
  const menuProps = {
    items,
    onClick: () => {},
  };
  const dropdownRender = (menu: React.ReactNode) => (
    <div className="left-[-20px] mt-[18px] w-[230px]">{menu}</div>
  );
  return (
    <Dropdown
      menu={menuProps}
      dropdownRender={dropdownRender}
      trigger={["click"]}
      className=" w-max"
      // overlayClassName="absolute left-[-200px]"
      placement="bottomLeft"
    >
      <div
        className="relative flex h-10 items-center p-2"
        onClick={() => setDropdownOpen(!dropDownOpen)}
      >
        {/* <DeleteFilled
className="w-6 text-red-600"
style={{ fontSize: "24px" }}
onClick={() => {
  // deleteTask(task.id);
}}
/> */}
        {children}
      </div>
    </Dropdown>
  );
};

export default StatusDropdownComponent;

const statusComponent = (status: Status, selectedStatus: Status) => {
  return {
    key: `${Math.random()}`,
    label: (
      <div className="flex flex-col gap-2">
        <div>{taskStatusEnum[status]}</div>
        <div
          className={`${
            status === selectedStatus && "border-r-2 bg-[#ECECED] "
          } p-1`}
        >
          <div
            style={{
              backgroundColor: statusBGColorEnum[status],
              border: `1px solid ${statusBorderColorEnum[status]}`,
              borderRadius: "36px",
            }}
            className="flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: statusBorderColorEnum[status],
              }}
            />

            <div>{taskStatusEnum[status]}</div>
          </div>
        </div>
      </div>
    ),
  };
};
