import { Button, Dropdown, MenuProps } from "antd";
import { useState } from "react";

import { MoreOutlined } from "@ant-design/icons";
import { LuCheck, LuX } from "react-icons/lu";
import { WorkspaceMemberDto, WorkspaceMemberStatus } from "models/user";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { userAPI } from "APIs";

type Props = {
  member: WorkspaceMemberDto;
  updateMember: Function;
};

const MoreFunctionMembersPageComponent = ({ member, updateMember }: Props) => {
  const [dropDownOpen, setDropdownOpen] = useState(false);
  const user = useAppSelector((state: RootState) => state.userSlice.user);

  const items: MenuProps["items"] = [];

  const changeStatus = async (status: WorkspaceMemberStatus) => {
    const res = await userAPI.updateMemberStatus(member.id, status);
    if (res) updateMember({ ...member, status: status });
  };

  if (member.status === "ACTIVE") {
    items.push({
      key: "1",
      label: (
        <Button
          className=" flex items-center gap-2 border-none p-1"
          onClick={() => changeStatus("INACTIVE")}
          type={user.role !== "ADMIN" ? "default" : "text"}
          disabled={user.role !== "ADMIN"}
        >
          <LuX />
          Deactivate
        </Button>
      ),
    });
    items.push({
      key: "2",
      label: (
        <Button
          className="flex w-full items-center gap-2 border-none p-1"
          onClick={() => changeStatus("DELETED")}
          type={user.role !== "ADMIN" ? "default" : "text"}
          disabled={user.role !== "ADMIN"}
        >
          <LuX />
          Delete
        </Button>
      ),
    });
  } else if (member.status === "INACTIVE") {
    items.push({
      key: "0",
      label: (
        <Button
          className=" flex items-center gap-2 border-none p-1"
          onClick={() => changeStatus("ACTIVE")}
          type={user.role !== "ADMIN" ? "default" : "text"}
          disabled={user.role !== "ADMIN"}
        >
          <LuCheck />
          Activate
        </Button>
      ),
    });
    items.push({
      key: "2",
      label: (
        <Button
          className="flex w-full items-center gap-2 border-none p-1"
          onClick={() => changeStatus("DELETED")}
          type={user.role !== "ADMIN" ? "default" : "text"}
          disabled={user.role !== "ADMIN"}
        >
          <LuX />
          Delete
        </Button>
      ),
    });
  } else if (member.status === "DELETED") {
    items.push({
      key: "4",
      label: (
        <Button
          className=" flex items-center gap-2 border-none p-1"
          onClick={() => changeStatus("INVITED")}
          type={user.role !== "ADMIN" ? "default" : "text"}
          disabled={user.role !== "ADMIN"}
        >
          <LuCheck />
          Invite
        </Button>
      ),
    });
  }

  const menuProps = {
    items,
    onClick: () => {},
  };
  const dropdownRender = (menu: React.ReactNode) => (
    <div className="oneComponentDropdownItem">{menu}</div>
  );
  return (
    <Dropdown
      menu={menuProps}
      trigger={["click"]}
      className="relative"
      placement="bottomRight"
      dropdownRender={dropdownRender}
      overlayClassName="absolute left-[-200px] "
    >
      <Button
        onClick={() => setDropdownOpen(!dropDownOpen)}
        className="relative flex h-6 w-6 items-center justify-center p-2"
      >
        <MoreOutlined className="mx-auto w-6" style={{ fontSize: "16px" }} />
      </Button>
    </Dropdown>
  );
};

export default MoreFunctionMembersPageComponent;
