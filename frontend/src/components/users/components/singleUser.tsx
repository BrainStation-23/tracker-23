import { UserDto } from "models/user";
import PrimaryButton from "@/components/common/buttons/primaryButton";

type Props = {
  member: UserDto;
  updateApprovalUser: Function;
};
const SingleUser = ({ member, updateApprovalUser }: Props) => {
  return (
    <div className=" flex w-[500px] items-center justify-between rounded-lg border border-gray-600 p-4 hover:bg-gray-100">
      <div className="flex flex-col">
        <div className="text-base font-semibold">{member.email}</div>
      </div>
      <PrimaryButton
        className="flex w-24 justify-center"
        onClick={() => {
          updateApprovalUser({ approved: !member.approved }, member);
        }}
      >
        {member.approved ? "Reject" : "Approve"}
      </PrimaryButton>
    </div>
  );
};

export default SingleUser;
