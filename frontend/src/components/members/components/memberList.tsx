import { UserDto } from "models/user";
import SingleMember from "./singleMember";

type Props = {
  memberList: UserDto[];
};
const MemberList = ({ memberList }: Props) => {
  console.log(
    "🚀 ~ file: memberList.tsx:5 ~ MemberList ~ memberList:",
    memberList
  );
  return (
    <div className="my-5">
      {memberList.map((member) => (
        <SingleMember key={member.id} member={member} />
      ))}
    </div>
  );
};

export default MemberList;
