import { UserDto } from "models/user";

type Props = {
  member: UserDto;
};
const SingleMember = ({ member }: Props) => {
  return (
    <div className=" flex items-center justify-between rounded-lg border border-gray-600 p-4 hover:bg-gray-100">
      <div> {member.firstName + " " + member.lastName}</div>{" "}
      <div>{member.designation}</div>
      <div>{member.role}</div>
    </div>
  );
};

export default SingleMember;
