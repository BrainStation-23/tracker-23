import { InviteUserWorkspaceDto } from "models/invitations";
import InviteComponent from "./inviteComponent";
import { Empty } from "antd";
type Props = {
  data: InviteUserWorkspaceDto[];
  activeTab: "All" | "Pending" | "Responded";
};
const InvitesList = ({ data, activeTab }: Props) => {
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
          <InviteComponent invite={invite} key={invite.id} />
        ))
      ) : (
        <Empty description="No invitations"></Empty>
      )}
    </div>
  );
};

export default InvitesList;
