import { InviteUserWorkspaceDto } from "models/invitations";
import InviteComponent from "./inviteComponent";
import { Empty } from "antd";
type Props = {
  data: InviteUserWorkspaceDto[];
  activeTab: "All" | "Pending" | "Responded";
  updateInviteList: Function;
};
const InvitesList = ({ data, activeTab, updateInviteList }: Props) => {
  const filteredData =
    activeTab === "Pending"
      ? data.filter((invite) => invite.status === "INVITED")
      : activeTab === "Responded"
      ? data.filter((invite) => invite.status !== "INVITED")
      : data;
  return (
    <div className="flex flex-col gap-4">
      {filteredData?.length > 0 ? (
        filteredData?.map((invite: any) => (
          <InviteComponent
            invite={invite}
            key={invite.id}
            updateInviteList={updateInviteList}
          />
        ))
      ) : (
        <Empty description="No invitations"></Empty>
      )}
    </div>
  );
};

export default InvitesList;
