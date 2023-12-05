import { Select, Typography } from "antd";
import { SprintUser } from "models/reports";
import { StatusDto } from "models/tasks";
import { useEffect } from "react";
import { LuUsers } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";

type Props = {
  selectedUsers?: number[];
  setSelectedUsers?: Function;
  className?: string;
  userList: any;
};
type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};
const UsersSelectorComponent = ({
  selectedUsers,
  setSelectedUsers,
  className,
  userList,
}: Props) => {
  const { Text } = Typography;

  const Options = userList?.map((user: SprintUser) => {
    return {
      value: user.userId,
      label: user.name,
    };
  });

  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
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
  useEffect(() => {
    const tmpArray: any[] = [];
    selectedUsers?.map((user) => {
      Options?.map((option: any) => {
        if (option.value === user) tmpArray.push(option.value);
      });
    });
  }, [selectedUsers]);
  return (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <LuUsers size={20} />
      <Select
        placeholder="Select User"
        mode="multiple"
        tagRender={(props) => tagRender(props)}
        value={selectedUsers}
        className="w-full"
        showArrow
        maxTagCount={1}
        options={Options}
        onChange={(value) => {
          setSelectedUsers(value);
        }}
      />
    </div>
  );
};

export default UsersSelectorComponent;
