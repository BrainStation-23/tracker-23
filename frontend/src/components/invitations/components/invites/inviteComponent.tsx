import { Button, message } from "antd";
import { userAPI } from "APIs";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useDispatch } from "react-redux";

import { addWorkspaceSlice } from "@/storage/redux/workspacesSlice";

type Props = {
  invite: InviteUserWorkspaceDto;
  updateInviteList: Function;
};
const InviteComponent = ({ invite, updateInviteList }: Props) => {
  const dispatch = useDispatch();
  const acceptInvite = async () => {
    const res = await userAPI.acceptWorkspaceInvitation(invite.id);
    res && message.success("Invitation Accepted");
    res && updateInviteList(res);
    res.workspace && dispatch(addWorkspaceSlice(res.workspace));
  };
  const rejectInvite = async () => {
    const res = await userAPI.rejectWorkspaceInvitation(invite.id);
    res && message.success("Invitation Rejected");
  };

  return (
    <div className=" flex w-[700px] items-center justify-between rounded-lg border border-gray-600 p-4 hover:bg-gray-100">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div>
            <span className="font-semibold">Workspace :</span>{" "}
            {invite.workspace.name}
          </div>
          <div>
            <span className="font-semibold">Role :</span> {invite.role}
          </div>
        </div>
        <div className="flex flex-col">
          <div>
            <span className="font-semibold">Inviter :</span>{" "}
            {invite.inviter.firstName}
          </div>
          <div>
            <span className="font-semibold">Status :</span> {invite.status}
          </div>
        </div>
      </div>
      {invite.status === "INVITED" ? (
        <div className="flex items-center gap-4">
          <Button onClick={acceptInvite}>Accept</Button>
          <Button danger onClick={rejectInvite}>
            Reject
          </Button>
        </div>
      ) : (
        <div>
          <span className="font-semibold">Status :</span> {invite.status}
        </div>
      )}
    </div>
  );
};

export default InviteComponent;
