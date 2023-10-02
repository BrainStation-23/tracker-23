import { UserDto } from "models/user";

type Props = {
  member: UserDto;
};
const SingleMember = ({ member }: Props) => {
  return (
    <div className=" flex w-[500px] items-center justify-between rounded-lg border border-gray-600 p-4 hover:bg-gray-100">
      <div className="flex flex-col">
        <div className="text-base font-semibold">
          {member.firstName + " " + member.lastName}
        </div>{" "}
        <div className="text-sm">{member.designation}</div>
      </div>
      <div>
        <span className="font-medium">Role :</span> {member.role}
      </div>
    </div>
  );
};

export default SingleMember;
