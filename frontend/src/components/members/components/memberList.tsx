import { UserDto } from "models/user";
import SingleMember from "./singleMember";

type Props = {
  memberList: UserDto[];
};
const MemberList = ({ memberList }: Props) => {
  return (
    <div className="my-5 flex gap-4">
      {memberList.map((member) => (
        <SingleMember key={member.id} member={member} />
      ))}
    </div>
  );
};

export default MemberList;
