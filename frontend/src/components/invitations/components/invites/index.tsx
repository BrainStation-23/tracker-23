import { Empty, Spin } from "antd";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useState } from "react";

import InviteComponent from "./inviteComponent";

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

  const [spinning, setSpinning] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Spin spinning={spinning}>
        {filteredData?.length > 0 ? (
          filteredData?.map((invite: any) => (
            <InviteComponent
              invite={invite}
              key={invite.id}
              updateInviteList={updateInviteList}
              {...{ setSpinning }}
            />
          ))
        ) : (
          <Empty description="No invitations"></Empty>
        )}
      </Spin>
    </div>
  );
};

export default InvitesList;
