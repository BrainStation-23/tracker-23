import { UserDto, updateApprovalUserDto } from "models/user";
import SingleUser from "./singleUser";
import { userAPI } from "APIs";

type Props = {
  userList: UserDto[];
  updateUser: Function;
  setSpinning: Function;
};
const UserList = ({ userList, updateUser, setSpinning }: Props) => {
  const updateApprovalUser = async (
    data: updateApprovalUserDto,
    member: UserDto
  ) => {
    setSpinning(true);
    const res: UserDto = await userAPI.updateApprovalUser(member.id, data);
    if (res) updateUser(res);
    setSpinning(false);
  };
  return (
    <div className="my-5 flex flex-col gap-4">
      {userList.map((member) => (
        <SingleUser
          key={member.id}
          member={member}
          updateApprovalUser={updateApprovalUser}
        />
      ))}
    </div>
  );
};

export default UserList;
