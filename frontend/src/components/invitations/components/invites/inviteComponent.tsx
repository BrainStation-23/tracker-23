import { Button } from "antd";
import { InviteUserWorkspaceDto } from "models/invitations";

type Props = {
  invite: InviteUserWorkspaceDto;
};
const InviteComponent = ({ invite }: Props) => {
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
          <Button>Accept</Button>
          <Button danger>Reject</Button>
        </div>
      ) : (
        <div>Status : {invite.status}</div>
      )}
    </div>
  );
};

export default InviteComponent;
