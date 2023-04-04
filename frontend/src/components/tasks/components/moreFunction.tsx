import { DeleteFilled, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Tooltip } from "antd";
import { TaskDto } from "models/tasks";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { useState } from "react";
import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import PinIconSvg from "@/assets/svg/PinIconSvg";
import PinFilledIconSvg from "@/assets/svg/PinFilledIconSvg";
type Props = {
  deleteTask: Function;
  task: TaskDto;
  handlePin: Function;
};

const MoreFunctionComponent = ({ deleteTask, task, handlePin }: Props) => {
  const [dropDownOpen, setDropdownOpen] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button
          className="-2 flex gap-2 p-1 hover:bg-white"
          onClick={() => {
            deleteTask(task.id);
          }}
          type="ghost"
        >
          <DeleteIconSvg />
          Delete
        </Button>
      ),
    },
    {
      key: "1",
      label: (
        <Button
          className="-2 flex w-full gap-3 p-1 hover:bg-white"
          onClick={() => {
            handlePin(task);
          }}
          type="ghost"
        >
          {task.pinned ? <PinFilledIconSvg /> : <PinIconSvg />}
          {task.pinned ? "Unpin" : "Pin"}
        </Button>
      ),
    },
  ];

  const menuProps = {
    items,
    onClick: () => {},
  };
  const dropdownRender = (menu: React.ReactNode) => (
    <div className="left-[-20px]">{menu}</div>
  );
  return (
    <Dropdown
      menu={menuProps}
      dropdownRender={dropdownRender}
      trigger={["click"]}
      className="relative"
      overlayClassName="absolute left-[-200px]"
      placement="bottomRight"
    >
      <Button
        className="relative flex h-10 w-10 items-center p-2"
        onClick={() => setDropdownOpen(!dropDownOpen)}
      >
        {/* <DeleteFilled
    className="w-6 text-red-600"
    style={{ fontSize: "24px" }}
    onClick={() => {
      // deleteTask(task.id);
    }}
  /> */}
        <MoreOutlined className="w-6" style={{ fontSize: "24px" }} />
        {/* <div
        className={`absolute top-[40px] right-0 z-20 rounded-lg bg-white p-4 ${
          dropDownOpen ? "" : "hidden"
        }`}
        style={{
          border: "1px solid rgb(236, 236, 237)",
        }}
      >
        <DeleteFilled
          className="w-6 text-red-600"
          style={{ fontSize: "24px" }}
          onClick={() => {
            deleteTask(task.id);
          }}
        />
      </div> */}
      </Button>
    </Dropdown>
  );
};

export default MoreFunctionComponent;
