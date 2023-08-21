import { changeWorkspaceReloadStatusSlice } from "@/storage/redux/workspacesSlice";
import { userAPI } from "APIs";
import { Button, message } from "antd";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useDispatch } from "react-redux";

type Props = {
  invite: InviteUserWorkspaceDto;
};
const InviteComponent = ({ invite }: Props) => {
  const dispatch = useDispatch();
  const acceptInvite = async () => {
    const res = await userAPI.acceptWorkspaceInvitation(invite.id);
    res && message.success("Invitation Accepted");
    dispatch(changeWorkspaceReloadStatusSlice());
  };
  const rejectInvite = async () => {
    const res = await userAPI.rejectWorkspaceInvitation(invite.id);
    res && message.success("Invitation Rejected");
    dispatch(changeWorkspaceReloadStatusSlice());
  };

  return (
    <div className=" flex items-center justify-between rounded-lg border border-gray-600 p-4 hover:bg-gray-100">
      <div className="flex items-center gap-4">
        <div>Workspace : {invite.workspace.name}</div>
        <div>Role : {invite.role}</div>
        <div>Inviter : {invite.inviter.firstName}</div>
        <div>Status : {invite.status}</div>
      </div>
      {invite.status === "INVITED" ? (
        <div className="flex items-center gap-4">
          <Button onClick={acceptInvite}>Accept</Button>
          <Button danger onClick={rejectInvite}>
            Reject
          </Button>
        </div>
      ) : (
        <div>Status : {invite.status}</div>
      )}
    </div>
  );
};

export default InviteComponent;
