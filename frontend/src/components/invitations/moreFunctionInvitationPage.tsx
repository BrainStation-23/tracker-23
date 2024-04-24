import { Button, Dropdown, MenuProps } from "antd";
import { useState } from "react";

import { MoreOutlined } from "@ant-design/icons";
import { InviteUserWorkspaceDto } from "models/invitations";
import { LuCheck, LuX } from "react-icons/lu";

type Props = {
  invitedUser: InviteUserWorkspaceDto;
  acceptInvite: Function;
  rejectInvite: Function;
};

const MoreFunctionInvitationPageComponent = ({
  invitedUser,
  acceptInvite,
  rejectInvite,
}: Props) => {
  const [dropDownOpen, setDropdownOpen] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button
          className=" flex items-center gap-2 border-none p-1"
          onClick={() => {
            acceptInvite(invitedUser);
          }}
          type="default"
          disabled={invitedUser.status !== "INVITED"}
        >
          <LuCheck />
          Accept
        </Button>
      ),
    },
    {
      key: "2",
      label: (
        <Button
          className="flex w-full items-center gap-2 border-none p-1"
          onClick={() => {
            rejectInvite(invitedUser);
          }}
          type="default"
          disabled={invitedUser.status !== "INVITED"}
        >
          <LuX />
          Reject
        </Button>
      ),
    },
  ];

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
      dropdownRender={dropdownRender}
      trigger={["click"]}
      className="relative "
      overlayClassName="absolute left-[-200px] "
      placement="bottomRight"
    >
      <Button
        className="relative flex h-6 w-6 items-center justify-center p-2"
        onClick={() => setDropdownOpen(!dropDownOpen)}
      >
        <MoreOutlined className="mx-auto w-6" style={{ fontSize: "16px" }} />
      </Button>
    </Dropdown>
  );
};

export default MoreFunctionInvitationPageComponent;
