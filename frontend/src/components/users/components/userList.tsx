import { UserDto } from "models/user";
import SingleUser from "./singleUser";

type Props = {
  userList: UserDto[];
  updateUser: Function;
};
const UserList = ({ userList, updateUser }: Props) => {
  return (
    <div className="my-5 flex flex-col gap-4">
      {userList.map((member) => (
        <SingleUser key={member.id} member={member} updateUser={updateUser} />
      ))}
    </div>
  );
};

export default UserList;
