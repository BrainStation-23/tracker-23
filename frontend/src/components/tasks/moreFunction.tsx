import { Button, Dropdown, MenuProps } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";

import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import PinFilledIconSvg from "@/assets/svg/PinFilledIconSvg";
import PinIconSvg from "@/assets/svg/PinIconSvg";
import { EditOutlined, MoreOutlined } from "@ant-design/icons";
import { LuMoreVertical } from "react-icons/lu";

type Props = {
  deleteTask: Function;
  task: TaskDto;
  handlePin: Function;
  handleAddManualWorkLog: Function;
};

const MoreFunctionComponent = ({
  deleteTask,
  task,
  handlePin,
  handleAddManualWorkLog,
}: Props) => {
  const [dropDownOpen, setDropdownOpen] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button
          className=" flex items-center gap-2 px-2 py-1"
          onClick={() => handleAddManualWorkLog(task)}
          type="text"
        >
          <EditOutlined />
          Add Work Log
        </Button>
      ),
    },
    {
      key: "2",
      label: (
        <Button
          className="flex w-full gap-2 px-2 py-1"
          onClick={() => deleteTask(task.id)}
          type="text"
        >
          <DeleteIconSvg />
          Delete
        </Button>
      ),
    },
    {
      key: "3",
      label: (
        <Button
          className=" flex w-full gap-3 px-2 py-1"
          onClick={() => handlePin(task)}
          type="text"
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

  return (
    <Dropdown
      menu={menuProps}
      placement="bottomRight"
      open={dropDownOpen}
      onOpenChange={(open) => {
        setDropdownOpen(open);
      }}
      dropdownRender={(menu: React.ReactNode) => (
        <div className="custom-dropdown-bg float-right">{menu}</div>
      )}
      trigger={["click"]}
      className="custom-dropdown-bg flex h-[33px] items-center justify-center rounded-lg border-[1px]  p-2"
    >
      <div>
        <LuMoreVertical />
      </div>
    </Dropdown>
  );
};

export default MoreFunctionComponent;
