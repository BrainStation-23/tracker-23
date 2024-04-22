import { Empty, message, Spin } from "antd";
import { userAPI } from "APIs";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useDispatch } from "react-redux";

import { addWorkspaceSlice } from "@/storage/redux/workspacesSlice";

import InvitationList from "../invitaionList";

type Props = {
  data: InviteUserWorkspaceDto[];
  activeTab: "All" | "Pending" | "Responded";
  updateInviteList: Function;
  spinning: boolean;
  setSpinning: Function;
};
const InvitesList = ({
  data,
  activeTab,
  updateInviteList,
  spinning,
  setSpinning,
}: Props) => {
  const filteredData =
    activeTab === "Pending"
      ? data.filter((invite) => invite.status === "INVITED")
      : activeTab === "Responded"
      ? data.filter((invite) => invite.status !== "INVITED")
      : data;

  const dispatch = useDispatch();
  const acceptInvite = async (invite: InviteUserWorkspaceDto) => {
    setSpinning(true);
    const res = await userAPI.acceptWorkspaceInvitation(invite.id);
    res && message.success("Invitation Accepted");
    res && updateInviteList(res);
    res.workspace && dispatch(addWorkspaceSlice(res.workspace));
    setSpinning(false);
  };
  const rejectInvite = async (invite: InviteUserWorkspaceDto) => {
    setSpinning(true);
    const res = await userAPI.rejectWorkspaceInvitation(invite.id);
    res && updateInviteList(res);
    res && message.success("Invitation Rejected");
    setSpinning(false);
  };
  return (
    <div className="flex flex-col gap-4">
      <Spin spinning={spinning}>
        {filteredData.length === 0 && !spinning ? (
          <Empty description="No invitations" />
        ) : filteredData.length > 0 ? (
          <InvitationList
            invitationList={filteredData}
            {...{ acceptInvite, rejectInvite }}
          />
        ) : spinning ? (
          <Empty description="Getting Data..." />
        ) : (
          <Empty description="Nothing to show" />
        )}
      </Spin>
    </div>
  );
};

export default InvitesList;
