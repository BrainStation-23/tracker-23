import { StatusDto } from "models/tasks";
import { LuUsers } from "react-icons/lu";
import { Select, Tooltip, Typography } from "antd";
import { SprintUser } from "models/reports";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import classNames from "classnames";

const { Text } = Typography;

type Props = {
  userList: any;
  className?: string;
  selectedUsers?: number[];
  setSelectedUsers?: Function;
  readonly?: boolean;
};

type TagProps = {
  label: any;
  onClose: any;
  closable: any;
  value: StatusDto;
};

const UsersSelectorComponent = ({
  userList,
  className,
  selectedUsers,
  setSelectedUsers,
  readonly,
}: Props) => {
  const selectOptions = userList?.map((user: SprintUser) => ({
    value: user.userId,
    label: user.name,
  }));

  return readonly ? (
    <div
      className={classNames("flex items-center justify-center gap-1", {
        ["hidden"]: !selectedUsers || !(selectedUsers?.length > 0),
      })}
    >
      <Tooltip title="User(s)">
        <LuUsers size={16} />
      </Tooltip>
      <div>
        {selectedUsers.length} {selectedUsers.length === 1 ? "User" : "Users"}
      </div>
    </div>
  ) : (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <LuUsers size={20} />
      <Select
        showArrow
        mode="multiple"
        maxTagCount={1}
        className="w-full"
        value={selectedUsers}
        options={selectOptions}
        placeholder="Select User"
        onChange={(value) => setSelectedUsers(value)}
        tagRender={(props) => tagRender(props, selectedUsers)}
      />
    </div>
  );
};

export default UsersSelectorComponent;

const tagRender = (props: TagProps, selectedUsers: number[]) => {
  const { label, onClose } = props;

  return (
    <div
      onClick={onClose}
      className="m-1 flex w-max cursor-pointer items-center gap-1 rounded border-[1px] border-secondary px-2 py-0.5 text-xs font-medium text-black"
    >
      {selectedUsers.length > 1 ? (
        <div className="flex w-max max-w-[30px] items-center text-sm">
          <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
            {label}
          </Text>
        </div>
      ) : (
        <div className="flex w-max max-w-[100px] items-center text-sm">
          <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
            {label}
          </Text>
        </div>
      )}
      <CrossIconSvg />
    </div>
  );
};
