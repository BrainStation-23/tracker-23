import { DeleteFilled, MoreOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
type Props = {
  deleteTask: Function;
  task: TaskDto;
};

const MoreFunctionComponent = ({ deleteTask, task }: Props) => {
  const [dropDownOpen, setDropdownOpen] = useState(false);
  return (
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
      <div
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
      </div>
    </Button>
  );
};

export default MoreFunctionComponent;
