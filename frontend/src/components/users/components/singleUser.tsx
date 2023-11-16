import PrimaryButton from "@/components/common/buttons/primaryButton";
import { userAPI } from "APIs";
import { UserDto, updateApprovalUserDto } from "models/user";
import { useEffect } from "react";

type Props = {
  member: UserDto;
  updateUser: Function;
};
const SingleUser = ({ member, updateUser }: Props) => {
  const updateApprovalUser = async (data: updateApprovalUserDto) => {
    const res: UserDto = await userAPI.updateApprovalUser(member.id, data);
    if (res) updateUser(res);
  };
  useEffect(() => {
    console.log(
      "🚀 ~ file: singleUser.tsx:17 ~ updateApprovalUser ~ member.approved:",
      member.approved
    );
  }, [member, member.approved]);
  return (
    <div className=" flex w-[500px] items-center justify-between rounded-lg border border-gray-600 p-4 hover:bg-gray-100">
      <div className="flex flex-col">
        <div className="text-base font-semibold">{member.email}</div>
      </div>
      <PrimaryButton
        className="flex w-24 justify-center"
        onClick={() => {
          updateApprovalUser({ approved: !member.approved });
        }}
      >
        {member.approved ? "Reject" : "Approve"}
      </PrimaryButton>
    </div>
  );
};

export default SingleUser;
